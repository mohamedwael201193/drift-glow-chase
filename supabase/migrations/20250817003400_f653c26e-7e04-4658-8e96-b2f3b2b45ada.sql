-- Add policies for wallet address-based upserts
CREATE POLICY "anon_can_insert_scores" 
ON public.scores 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "anon_can_update_scores" 
ON public.scores 
FOR UPDATE 
TO anon 
USING (true);