import { supabase } from "../src/lib/supabase";

export default async function handler(req, res) {
    const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

    if (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }

    return res.status(200).json({
        success: true,
        message: "Supabase est active",
        time: new Date().toISOString(),
    });
}