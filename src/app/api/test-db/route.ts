import { NextResponse } from "next/server";
import { createClient } from '~/utils/supabase/server';

export async function GET() {
  console.log("=== Testing Supabase Connection ===");
  
  try {
    const supabase = await createClient();
    
    // Test query
    const { data, error } = await supabase
      .from('user_notification_details')
      .select('*')
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log("Supabase connection successful");
    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection successful",
      data 
    });
  } catch (error) {
    console.error("Error testing Supabase:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to Supabase" 
    }, { status: 500 });
  }
} 