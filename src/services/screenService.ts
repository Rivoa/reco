import { createClient } from "@/utils/supabase/client";
import { AppScreen, FlutterWidget } from "@/app/(dashboard)/developer/types";

const supabase = createClient();

export const ScreenService = {
  // --- FETCH ALL ---
  async getScreens(): Promise<AppScreen[]> {
    const { data, error } = await supabase
      .from('screens')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Map DB snake_case to our AppScreen interface if needed, 
    // but our interface matches mostly.
    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      layout: s.layout as FlutterWidget
    }));
  },

  // --- CREATE ---
  async createScreen(name: string, layout: FlutterWidget): Promise<AppScreen> {
    const { data, error } = await supabase
      .from('screens')
      .insert([{ name, layout }])
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, name: data.name, layout: data.layout };
  },

  // --- UPDATE LAYOUT (Auto-save) ---
  async updateLayout(id: string, layout: FlutterWidget) {
    const { error } = await supabase
      .from('screens')
      .update({ layout, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) console.error("Auto-save failed:", error);
  },

  // --- DELETE ---
  async deleteScreen(id: string) {
    const { error } = await supabase.from('screens').delete().eq('id', id);
    if (error) throw error;
  }
};