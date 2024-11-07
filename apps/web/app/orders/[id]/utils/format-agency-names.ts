export function convertToTitleCase(input: string): string {
  if(input == 'pending' || input == 'pending_response'){
    return 'Pending Response'
  }else if(input == 'annulled'){
    return 'Annulled'
  }

  return input
    .split('_')
    .map(word =>                                     
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');                                      
}

export function convertToSnakeCase(input: string): string {
  return input
    .split(' ')                            
    .map(word => word.toLowerCase())       
    .join('_');
}

export function convertToCamelCase(input: string): string {
  if(input == 'anulled'){
    return 'annulled'
  }
  const words = input.split(/[_ ]+/);

  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}