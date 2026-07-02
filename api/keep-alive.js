import { supabase } from "../src/lib/supabase";

export default async function handler(req, res) {
    try {
        const { error } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Supabase error:", error.message);
            // Renvoie 200 quand même pour pas casser cron-job
            return res.status(200).json({
                success: false,
                message: "Supabase check failed but keep-alive OK",
                error: error.message,
                time: new Date().toISOString(),
            });
        }

        return res.status(200).json({
            success: true,
            message: "Supabase est active",
            time: new Date().toISOString(),
        });
    } catch (e) {
        console.error(e);
        return res.status(200).json({
            success: false,
            message: "Keep-alive OK mais crash catché",
            time: new Date().toISOString(),
        });
    }
}