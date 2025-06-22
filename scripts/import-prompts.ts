import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import Papa from 'papaparse';
import path from 'path';
import dotenv from 'dotenv';

// Explicitly load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function importPrompts() {
  console.log('Starting prompt import script...');
  console.log(`Loading environment variables from: ${envPath}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Could not find NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    throw new Error('Supabase URL or Service Role Key is not defined in .env.local file');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const csvFilePath = path.join(process.cwd(), 'public', 'csv', 'solara affirmations.csv');
  console.log(`Reading CSV file from: ${csvFilePath}`);

  try {
    await fs.access(csvFilePath);
  } catch (error) {
    console.error(`Error accessing CSV file: ${csvFilePath}. Please ensure the file exists.`);
    return;
  }
  
  const csvContent = await fs.readFile(csvFilePath, 'utf8');

  const parsed = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error('Errors parsing CSV:', parsed.errors);
    return;
  }

  const promptsToInsert = parsed.data
    .map((row: any) => {
      const originalType = (row.prompt_type || '').toLowerCase();
      let newType = '';

      if (originalType.includes('affirmation')) {
        newType = 'affirmation';
      } else if (originalType.includes('prompt')) {
        newType = 'daily_prompt';
      }

      return {
        prompt_type: newType,
        prompt_description: row.prompt_description,
        prompt_author: row.prompt_author || 'Abri Mathos',
        inspiration_notes: row['for_Inspiration?'] || null,
        is_active: true,
      };
    })
    .filter((p: any) => p.prompt_type && p.prompt_description); // Filter out invalid or empty rows

  if (promptsToInsert.length === 0) {
    console.log('No valid prompts found in CSV to insert.');
    return;
  }

  console.log(`Attempting to insert ${promptsToInsert.length} prompts...`);

  // Clear existing prompts to avoid duplicates
  console.log('Clearing existing prompts from daily_prompts table...');
  const { error: deleteError } = await supabase.from('daily_prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  if (deleteError) {
    console.error('Error clearing existing prompts:', deleteError);
    return;
  }
  console.log('Existing prompts cleared.');

  const { data, error } = await supabase.from('daily_prompts').insert(promptsToInsert).select();

  if (error) {
    console.error('Error inserting prompts into Supabase:', error);
  } else {
    console.log(`Successfully inserted ${data.length} prompts.`);
  }

  console.log('Prompt import script finished.');
}

importPrompts().catch(console.error); 