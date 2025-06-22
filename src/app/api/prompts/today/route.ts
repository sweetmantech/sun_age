import { NextResponse } from 'next/server';
import { createClient } from '~/utils/supabase/server';

// Helper function to format the daily content response
const formatDailyContent = (date: string, primaryPrompt: any, secondaryPrompts: any[]) => {
  return {
    date: date,
    primary: {
      type: primaryPrompt.prompt_type,
      text: primaryPrompt.prompt_description,
      author: primaryPrompt.prompt_author,
      id: primaryPrompt.id,
    },
    secondary: secondaryPrompts.map((p: any) => ({
      type: p.prompt_type,
      text: p.prompt_description,
      author: p.prompt_author,
      id: p.id,
    })),
  };
};

// Main function to select daily content
export const selectDailyContent = async (date: Date) => {
  const supabase = await createClient();
  const dateString = date.toISOString().split('T')[0];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

  // 1. Check cache first
  const { data: existingSelection } = await supabase
    .from('daily_content_selections')
    .select('primary_prompt_id, secondary_prompt_ids')
    .eq('date', dateString)
    .single();

  if (existingSelection) {
    const { data: primaryPrompt } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('id', existingSelection.primary_prompt_id)
        .single();

    const { data: secondaryPrompts } = await supabase
        .from('daily_prompts')
        .select('*')
        .in('id', existingSelection.secondary_prompt_ids);
    
    if (primaryPrompt && secondaryPrompts) {
        return formatDailyContent(dateString, primaryPrompt, secondaryPrompts);
    }
  }

  // 2. Generate new selection if not in cache
  const { data: affirmations, error: affirmationsError } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('prompt_type', 'affirmation')
    .eq('is_active', true);

  if (affirmationsError) throw new Error(`Error fetching affirmations: ${affirmationsError.message}`);
  if (!affirmations || affirmations.length === 0) throw new Error('No active affirmations found in database.');

  const { data: dailyPrompts, error: promptsError } = await supabase
    .from('daily_prompts')
    .select('*')
    .eq('prompt_type', 'daily_prompt')
    .eq('is_active', true);

  if (promptsError) throw new Error(`Error fetching daily prompts: ${promptsError.message}`);
  if (!dailyPrompts || dailyPrompts.length === 0) throw new Error('No active daily prompts found in database.');

  // 3. Select primary affirmation (rotating)
  const primaryIndex = dayOfYear % affirmations.length;
  const primaryPrompt = affirmations[primaryIndex];

  // 4. Select 3 secondary prompts (rotating)
  const secondaryPrompts: any[] = [];
  for (let i = 0; i < 3; i++) {
    const index = (dayOfYear + i) % dailyPrompts.length;
    secondaryPrompts.push(dailyPrompts[index]);
  }
  const secondaryPromptIds = secondaryPrompts.map((p: any) => p.id);

  // 5. Cache the selection
  const { error: insertError } = await supabase.from('daily_content_selections').insert({
    date: dateString,
    primary_prompt_id: primaryPrompt.id,
    secondary_prompt_ids: secondaryPromptIds,
  });

  if (insertError) {
    if (insertError.code === '23505') { // unique_violation
      return selectDailyContent(date);
    }
    throw new Error(`Error caching daily content: ${insertError.message}`);
  }

  // 6. Return the newly created content
  return formatDailyContent(dateString, primaryPrompt, secondaryPrompts);
};


export async function GET() {
  try {
    const today = new Date();
    const content = await selectDailyContent(today);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching daily content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch daily content', details: errorMessage }, { status: 500 });
  }
} 