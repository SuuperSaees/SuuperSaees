'use client';

interface FormattedDateProps {
    date: string | null;
    className?: string;
  }
  
  export const FormattedDate: React.FC<FormattedDateProps> = ({ date, className }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      
      return `${month} ${day}, ${year}`;
    };
  
    if (!date) return null;
  
    try {
      const formattedDate = formatDate(date);
      return <span className={className}>{formattedDate}</span>;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };