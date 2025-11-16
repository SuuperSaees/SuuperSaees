import countryList from "country-list";

export const getCountries = () => {
  // Get data directly and sort by name for performance
  const data = countryList.getData();
  data.sort((a, b) => a.name.localeCompare(b.name));
  
  // Transform to match combobox BaseOption interface
  return data.map(country => ({
    value: country.name, // Save full country name
    label: country.name,
    code: country.code, // Keep code for reference
  }));
}; 