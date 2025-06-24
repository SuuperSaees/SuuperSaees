-- Add new permissions for briefs
-- This migration only adds the enum values
DO $$ 
BEGIN
  -- Add enum values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefs.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'briefs.read';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefs.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'briefs.write';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefs.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'briefs.delete';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'briefs.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'briefs.manage';
  END IF;
END $$; 