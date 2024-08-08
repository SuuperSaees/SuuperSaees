// import { useSupabase } from '@kit/supabase/hooks/use-supabase';

// export default function UploadImageComponent() {
//   const supabase = useSupabase();

//   const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       try {
//         const filePath = `images/${Date.now()}_${file.name}`;
//         const { data, error } = await supabase.storage.from('services').upload(filePath, file);

//         console.log('data', data);

//         if (error) {
//           throw new Error(`Error al subir la imagen: ${error.message}`);
//         }

//         const { data: publicURL,} = supabase.storage.from('services').getPublicUrl(filePath);

//         if ( !publicURL) {
//           throw new Error(`Error al obtener la URL pública`);
//         }

//         console.log('Imagen subida:', publicURL.publicUrl);
//         // Usa la URL pública como necesites
//       } catch (error) {
//         console.error('Error al subir la imagen:', error);
//       }
//     }
//   };

//   return <input type="file" accept="image/*" onChange={handleImageChange} />;
// }

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

interface UploadImageComponentProps {
  onImageUpload: (imageUrl: string) => void;
}

export default function UploadImageComponent({ onImageUpload }: UploadImageComponentProps) {
  const supabase = useSupabase();

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const filePath = `images/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('services').upload(filePath, file);

        if (data) {
          console.log('Imagen subida:', data);
        }

        if (error) {
          throw new Error(`Error al subir la imagen: ${error.message}`);
        }

        const { data: publicURL } = supabase.storage.from('services').getPublicUrl(filePath);

        if (!publicURL) {
          throw new Error(`Error al obtener la URL pública`);
        }

        onImageUpload(publicURL.publicUrl);  // Llamar a la función de callback con la URL de la imagen

      } catch (error) {
        console.error('Error al subir la imagen:', error);
      }
    }
  };

  return <input type="file" accept="image/*" onChange={handleImageChange} />;
}
