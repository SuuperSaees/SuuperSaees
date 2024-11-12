// DetailsSide.tsx
import React from 'react';
import BillingForm from './billing_form'; 
import { Service } from '~/lib/services.types';

type ServiceType = Service.Type;

type DetailsSideProps = {
    service: ServiceType; 
};

const DetailsSide: React.FC<DetailsSideProps> = ({ service }) => {
    return (
        <div className=''>
            <BillingForm service={service} />
        </div>
    );
};

export default DetailsSide;
