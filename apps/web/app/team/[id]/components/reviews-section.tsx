'use client';

import { useTranslation } from 'react-i18next';

import { usePagination } from '~/hooks/usePagination';

import CardReview from '../../../components/ui/card-review';
import Pagination from '../../../components/ui/pagination';
import ReviewRating from '../../../components/ui/review-rating';

// type Review = {
//   content: string;
//   created_at: string;
//   id: string;
//   order_id: number;
//   rating: number | null;
//   updated_at: string;
//   user_id: string;
// } & {
//   user?: User.Type;
// } & {
//   user: User;
// }

const dummyReviews = [
  {
    id: 'e4c1fffc-9bad-4263-af60-5c529fe32cfe',
    content:
      'Me gustó bastante! Vamos a revisarlo con el equipo y te enviaremos nuestros comentarios por la tarde.',
    rating: 5,
    user: {
      id: 'e4c1fffc-9bad-4263-af60-5c529fe32cfe',
      name: 'Samuel',
      picture_url: '',
      email: 'samuel@gmail.com',
      organization_id: 'e4c1fffc-9bad-4263-af60-5c529fe32cfe',
    },
    created_at: '2023-03-01T00:00:00.000Z',
    order_id: 1,
    updated_at: '2023-03-01T00:00:00.000Z',
    user_id: 'e4c1fffc-9bad-4263-af60-5c529fe32cfe',
    title: 'Pieza Masterclass Pagos Inmediatos',
  },
  {
    id: '12345678-1234-1234-1234-1234567890ab',
    content: 'Todo perfecto, muchas gracias.',
    rating: 4,
    user: {
      id: '12345678-1234-1234-1234-1234567890ab',
      name: 'Andrea',
      picture_url: '',
      email: 'andrea@gmail.com',
      organization_id: '12345678-1234-1234-1234-1234567890ab',
    },
    created_at: '2023-03-02T12:00:00.000Z',
    order_id: 2,
    updated_at: '2023-03-02T12:00:00.000Z',
    user_id: '12345678-1234-1234-1234-1234567890ab',
    title: 'Diseño Logo Corporativo',
  },
  {
    id: 'abcdef12-3456-7890-abcd-ef1234567890',
    content: 'No estamos muy satisfechos con el resultado.',
    rating: 2,
    user: {
      id: 'abcdef12-3456-7890-abcd-ef1234567890',
      name: 'Carlos',
      picture_url: '',
      email: 'carlos@gmail.com',
      organization_id: 'abcdef12-3456-7890-abcd-ef1234567890',
    },
    created_at: '2023-03-03T09:15:00.000Z',
    order_id: 3,
    updated_at: '2023-03-03T09:15:00.000Z',
    user_id: 'abcdef12-3456-7890-abcd-ef1234567890',
    title: 'Video Animado Presentación',
  },
  {
    id: 'fedcba98-7654-3210-fedc-ba9876543210',
    content:
      'Excelente trabajo, muy profesional. ¡Definitivamente volveremos a trabajar contigo!',
    rating: 5,
    user: {
      id: 'fedcba98-7654-3210-fedc-ba9876543210',
      name: 'Luisa',
      picture_url: '',
      email: 'luisa@gmail.com',
      organization_id: 'fedcba98-7654-3210-fedc-ba9876543210',
    },
    created_at: '2023-03-04T14:30:00.000Z',
    order_id: 4,
    updated_at: '2023-03-04T14:30:00.000Z',
    user_id: 'fedcba98-7654-3210-fedc-ba9876543210',
    title: 'Guía de Estilo Marca',
  },
  {
    id: '11223344-5566-7788-99aa-bbccddeeff00',
    content:
      'Cumplió las expectativas, aunque el plazo podría haber sido más corto.',
    rating: 3,
    user: {
      id: '11223344-5566-7788-99aa-bbccddeeff00',
      name: 'Mario',
      picture_url: '',
      email: 'mario@gmail.com',
      organization_id: '11223344-5566-7788-99aa-bbccddeeff00',
    },
    created_at: '2023-03-05T08:00:00.000Z',
    order_id: 5,
    updated_at: '2023-03-05T08:00:00.000Z',
    user_id: '11223344-5566-7788-99aa-bbccddeeff00',
    title: 'Campaña Redes Sociales',
  },
  {
    id: '33445566-7788-99aa-bbcc-ddeeff001122',
    content:
      'Me parece que hay muchos detalles por pulir en el diseño. No refleja completamente lo que buscábamos.',
    rating: 2,
    user: {
      id: '33445566-7788-99aa-bbcc-ddeeff001122',
      name: 'Diana',
      picture_url: '',
      email: 'diana@gmail.com',
      organization_id: '33445566-7788-99aa-bbcc-ddeeff001122',
    },
    created_at: '2023-03-06T17:00:00.000Z',
    order_id: 6,
    updated_at: '2023-03-06T17:00:00.000Z',
    user_id: '33445566-7788-99aa-bbcc-ddeeff001122',
    title: 'Manual de Usuario App',
  },
  {
    id: '55667788-99aa-bbcc-ddee-ff0011223344',
    content: '¡Súper rápido y de calidad!',
    rating: 5,
    user: {
      id: '55667788-99aa-bbcc-ddee-ff0011223344',
      name: 'Gabriel',
      picture_url: '',
      email: 'gabriel@gmail.com',
      organization_id: '55667788-99aa-bbcc-ddee-ff0011223344',
    },
    created_at: '2023-03-07T22:45:00.000Z',
    order_id: 7,
    updated_at: '2023-03-07T22:45:00.000Z',
    user_id: '55667788-99aa-bbcc-ddee-ff0011223344',
    title: 'Ilustración Conceptual',
  },
  {
    id: '77889900-aabb-ccdd-eeff-112233445566',
    content: 'Nos encantó el resultado final.',
    rating: 4,
    user: {
      id: '77889900-aabb-ccdd-eeff-112233445566',
      name: 'Valeria',
      picture_url: '',
      email: 'valeria@gmail.com',
      organization_id: '77889900-aabb-ccdd-eeff-112233445566',
    },
    created_at: '2023-03-08T11:20:00.000Z',
    order_id: 8,
    updated_at: '2023-03-08T11:20:00.000Z',
    user_id: '77889900-aabb-ccdd-eeff-112233445566',
    title: 'Brochure Informativo',
  },
  {
    id: '99aabbcc-ddee-ff00-1122-334455667788',
    content: 'Regular, esperaba un poco más de originalidad.',
    rating: 3,
    user: {
      id: '99aabbcc-ddee-ff00-1122-334455667788',
      name: 'Jorge',
      picture_url: '',
      email: 'jorge@gmail.com',
      organization_id: '99aabbcc-ddee-ff00-1122-334455667788',
    },
    created_at: '2023-03-09T15:00:00.000Z',
    order_id: 9,
    updated_at: '2023-03-09T15:00:00.000Z',
    user_id: '99aabbcc-ddee-ff00-1122-334455667788',
    title: 'Presentación Comercial',
  },
  {
    id: 'aabbccdd-eeff-0011-2233-445566778899',
    content:
      'Trabajo impecable, pero la comunicación podría mejorar para evitar malentendidos en futuros proyectos.',
    rating: 4,
    user: {
      id: 'aabbccdd-eeff-0011-2233-445566778899',
      name: 'Sophia',
      picture_url: '',
      email: 'sophia@gmail.com',
      organization_id: 'aabbccdd-eeff-0011-2233-445566778899',
    },
    created_at: '2023-03-10T19:30:00.000Z',
    order_id: 10,
    updated_at: '2023-03-10T19:30:00.000Z',
    user_id: 'aabbccdd-eeff-0011-2233-445566778899',
    title: 'Pieza Masterclass Pagos Inmediatos',
  },
];
export default function ReviewsSection() {
  const rating =
    dummyReviews.reduce((acc, review) => acc + review.rating, 0) /
    dummyReviews.length;

  const {
    startIndex,
    endIndex,
    currentPage,
    goToPage,
    previousPage,
    nextPage,
    totalPages,
  } = usePagination({
    totalItems: dummyReviews.length,
    pageSize: 4, // Define the number of items per page
  });

  const { t } = useTranslation('reviews');
  const paginatedReviews = dummyReviews?.slice(startIndex, endIndex) ?? [];

  return (
    <div className="flex h-full max-h-full w-full flex-wrap gap-16 lg:flex-nowrap">
      {!paginatedReviews.length ? (
        <div className='mx-auto flex flex-col gap-1 max-w-md text-center mt-8'>

        <span className="font-bold text-4xl text-gray-300">
          {t('empty.title')}
        </span>
        <p className="mx-auto text-sm text-gray-400">
          {t('empty.description')}
        </p>
        </div>
      ) : (
        <>
          <ReviewRating
            rating={rating}
            total={dummyReviews.length}
            className="shrink-0"
          />
          <div className="flex h-full w-full flex-col gap-4">
            {!paginatedReviews.length ? (
              <span className="mx-auto text-sm text-gray-400">
                {t('empty')}
              </span>
            ) : (
              <div className="flex h-full w-full flex-col gap-4">
                {paginatedReviews.map((review, index) => (
                  <CardReview
                    key={index}
                    title={review.title}
                    content={review.content}
                    createdAt={review.created_at}
                    rating={review.rating}
                    user={{
                      name: review.user.name,
                      picture_url: review.user.picture_url,
                    }}
                  />
                ))}
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  goToPage={goToPage}
                  previousPage={previousPage}
                  nextPage={nextPage}
                  className="mt-auto"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
