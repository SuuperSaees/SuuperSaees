export function convertToTitleCase(input: string): string {
  if(input == 'pending' || input == 'pending_response'){
    return 'Pending response'
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