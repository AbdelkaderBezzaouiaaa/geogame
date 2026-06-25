// Comprehensive country data - all countries with capitals, coordinates, flag emojis
// This avoids reliance on external APIs and ensures fast loading

export interface Country {
  name: string;
  capital: string;
  code: string;
  flag: string;
  lat: number;
  lng: number;
  continent: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', capital: 'Kabul', code: 'AF', flag: '🇦🇫', lat: 33.93, lng: 67.71, continent: 'Asia' },
  { name: 'Albania', capital: 'Tirana', code: 'AL', flag: '🇦🇱', lat: 41.15, lng: 20.17, continent: 'Europe' },
  { name: 'Algeria', capital: 'Algiers', code: 'DZ', flag: '🇩🇿', lat: 36.75, lng: 3.04, continent: 'Africa' },
  { name: 'Andorra', capital: 'Andorra la Vella', code: 'AD', flag: '🇦🇩', lat: 42.55, lng: 1.6, continent: 'Europe' },
  { name: 'Angola', capital: 'Luanda', code: 'AO', flag: '🇦🇴', lat: -8.84, lng: 13.23, continent: 'Africa' },
  { name: 'Antigua and Barbuda', capital: "St. John's", code: 'AG', flag: '🇦🇬', lat: 17.12, lng: -61.85, continent: 'North America' },
  { name: 'Argentina', capital: 'Buenos Aires', code: 'AR', flag: '🇦🇷', lat: -34.6, lng: -58.38, continent: 'South America' },
  { name: 'Armenia', capital: 'Yerevan', code: 'AM', flag: '🇦🇲', lat: 40.18, lng: 44.51, continent: 'Asia' },
  { name: 'Australia', capital: 'Canberra', code: 'AU', flag: '🇦🇺', lat: -35.28, lng: 149.13, continent: 'Oceania' },
  { name: 'Austria', capital: 'Vienna', code: 'AT', flag: '🇦🇹', lat: 48.21, lng: 16.37, continent: 'Europe' },
  { name: 'Azerbaijan', capital: 'Baku', code: 'AZ', flag: '🇦🇿', lat: 40.41, lng: 49.87, continent: 'Asia' },
  { name: 'Bahamas', capital: 'Nassau', code: 'BS', flag: '🇧🇸', lat: 25.03, lng: -77.35, continent: 'North America' },
  { name: 'Bahrain', capital: 'Manama', code: 'BH', flag: '🇧🇭', lat: 26.07, lng: 50.56, continent: 'Asia' },
  { name: 'Bangladesh', capital: 'Dhaka', code: 'BD', flag: '🇧🇩', lat: 23.81, lng: 90.41, continent: 'Asia' },
  { name: 'Barbados', capital: 'Bridgetown', code: 'BB', flag: '🇧🇧', lat: 13.09, lng: -59.61, continent: 'North America' },
  { name: 'Belarus', capital: 'Minsk', code: 'BY', flag: '🇧🇾', lat: 53.9, lng: 27.57, continent: 'Europe' },
  { name: 'Belgium', capital: 'Brussels', code: 'BE', flag: '🇧🇪', lat: 50.85, lng: 4.35, continent: 'Europe' },
  { name: 'Belize', capital: 'Belmopan', code: 'BZ', flag: '🇧🇿', lat: 17.25, lng: -88.77, continent: 'North America' },
  { name: 'Benin', capital: 'Porto-Novo', code: 'BJ', flag: '🇧🇯', lat: 6.5, lng: 2.63, continent: 'Africa' },
  { name: 'Bhutan', capital: 'Thimphu', code: 'BT', flag: '🇧🇹', lat: 27.47, lng: 89.64, continent: 'Asia' },
  { name: 'Bolivia', capital: 'Sucre', code: 'BO', flag: '🇧🇴', lat: -19.02, lng: -65.26, continent: 'South America' },
  { name: 'Bosnia and Herzegovina', capital: 'Sarajevo', code: 'BA', flag: '🇧🇦', lat: 43.86, lng: 18.41, continent: 'Europe' },
  { name: 'Botswana', capital: 'Gaborone', code: 'BW', flag: '🇧🇼', lat: -24.65, lng: 25.91, continent: 'Africa' },
  { name: 'Brazil', capital: 'Brasília', code: 'BR', flag: '🇧🇷', lat: -15.79, lng: -47.88, continent: 'South America' },
  { name: 'Brunei', capital: 'Bandar Seri Begawan', code: 'BN', flag: '🇧🇳', lat: 4.94, lng: 114.95, continent: 'Asia' },
  { name: 'Bulgaria', capital: 'Sofia', code: 'BG', flag: '🇧🇬', lat: 42.7, lng: 23.32, continent: 'Europe' },
  { name: 'Burkina Faso', capital: 'Ouagadougou', code: 'BF', flag: '🇧🇫', lat: 12.37, lng: -1.52, continent: 'Africa' },
  { name: 'Burundi', capital: 'Gitega', code: 'BI', flag: '🇧🇮', lat: -3.43, lng: 29.93, continent: 'Africa' },
  { name: 'Cabo Verde', capital: 'Praia', code: 'CV', flag: '🇨🇻', lat: 14.93, lng: -23.51, continent: 'Africa' },
  { name: 'Cambodia', capital: 'Phnom Penh', code: 'KH', flag: '🇰🇭', lat: 11.56, lng: 104.92, continent: 'Asia' },
  { name: 'Cameroon', capital: 'Yaoundé', code: 'CM', flag: '🇨🇲', lat: 3.87, lng: 11.52, continent: 'Africa' },
  { name: 'Canada', capital: 'Ottawa', code: 'CA', flag: '🇨🇦', lat: 45.42, lng: -75.69, continent: 'North America' },
  { name: 'Central African Republic', capital: 'Bangui', code: 'CF', flag: '🇨🇫', lat: 4.36, lng: 18.56, continent: 'Africa' },
  { name: 'Chad', capital: "N'Djamena", code: 'TD', flag: '🇹🇩', lat: 12.13, lng: 15.05, continent: 'Africa' },
  { name: 'Chile', capital: 'Santiago', code: 'CL', flag: '🇨🇱', lat: -33.45, lng: -70.67, continent: 'South America' },
  { name: 'China', capital: 'Beijing', code: 'CN', flag: '🇨🇳', lat: 39.91, lng: 116.39, continent: 'Asia' },
  { name: 'Colombia', capital: 'Bogotá', code: 'CO', flag: '🇨🇴', lat: 4.71, lng: -74.07, continent: 'South America' },
  { name: 'Comoros', capital: 'Moroni', code: 'KM', flag: '🇰🇲', lat: -11.7, lng: 43.26, continent: 'Africa' },
  { name: 'Congo (DRC)', capital: 'Kinshasa', code: 'CD', flag: '🇨🇩', lat: -4.32, lng: 15.31, continent: 'Africa' },
  { name: 'Congo (Republic)', capital: 'Brazzaville', code: 'CG', flag: '🇨🇬', lat: -4.27, lng: 15.28, continent: 'Africa' },
  { name: 'Costa Rica', capital: 'San José', code: 'CR', flag: '🇨🇷', lat: 9.93, lng: -84.09, continent: 'North America' },
  { name: "Côte d'Ivoire", capital: 'Yamoussoukro', code: 'CI', flag: '🇨🇮', lat: 6.83, lng: -5.29, continent: 'Africa' },
  { name: 'Croatia', capital: 'Zagreb', code: 'HR', flag: '🇭🇷', lat: 45.81, lng: 15.98, continent: 'Europe' },
  { name: 'Cuba', capital: 'Havana', code: 'CU', flag: '🇨🇺', lat: 23.11, lng: -82.37, continent: 'North America' },
  { name: 'Cyprus', capital: 'Nicosia', code: 'CY', flag: '🇨🇾', lat: 35.17, lng: 33.37, continent: 'Europe' },
  { name: 'Czech Republic', capital: 'Prague', code: 'CZ', flag: '🇨🇿', lat: 50.07, lng: 14.42, continent: 'Europe' },
  { name: 'Denmark', capital: 'Copenhagen', code: 'DK', flag: '🇩🇰', lat: 55.68, lng: 12.57, continent: 'Europe' },
  { name: 'Djibouti', capital: 'Djibouti', code: 'DJ', flag: '🇩🇯', lat: 11.59, lng: 43.15, continent: 'Africa' },
  { name: 'Dominica', capital: 'Roseau', code: 'DM', flag: '🇩🇲', lat: 15.3, lng: -61.39, continent: 'North America' },
  { name: 'Dominican Republic', capital: 'Santo Domingo', code: 'DO', flag: '🇩🇴', lat: 18.49, lng: -69.97, continent: 'North America' },
  { name: 'Ecuador', capital: 'Quito', code: 'EC', flag: '🇪🇨', lat: -0.18, lng: -78.47, continent: 'South America' },
  { name: 'Egypt', capital: 'Cairo', code: 'EG', flag: '🇪🇬', lat: 30.04, lng: 31.24, continent: 'Africa' },
  { name: 'El Salvador', capital: 'San Salvador', code: 'SV', flag: '🇸🇻', lat: 13.69, lng: -89.19, continent: 'North America' },
  { name: 'Equatorial Guinea', capital: 'Malabo', code: 'GQ', flag: '🇬🇶', lat: 3.75, lng: 8.78, continent: 'Africa' },
  { name: 'Eritrea', capital: 'Asmara', code: 'ER', flag: '🇪🇷', lat: 15.33, lng: 38.93, continent: 'Africa' },
  { name: 'Estonia', capital: 'Tallinn', code: 'EE', flag: '🇪🇪', lat: 59.44, lng: 24.75, continent: 'Europe' },
  { name: 'Eswatini', capital: 'Mbabane', code: 'SZ', flag: '🇸🇿', lat: -26.32, lng: 31.13, continent: 'Africa' },
  { name: 'Ethiopia', capital: 'Addis Ababa', code: 'ET', flag: '🇪🇹', lat: 9.02, lng: 38.75, continent: 'Africa' },
  { name: 'Fiji', capital: 'Suva', code: 'FJ', flag: '🇫🇯', lat: -18.14, lng: 178.44, continent: 'Oceania' },
  { name: 'Finland', capital: 'Helsinki', code: 'FI', flag: '🇫🇮', lat: 60.17, lng: 24.94, continent: 'Europe' },
  { name: 'France', capital: 'Paris', code: 'FR', flag: '🇫🇷', lat: 48.86, lng: 2.35, continent: 'Europe' },
  { name: 'Gabon', capital: 'Libreville', code: 'GA', flag: '🇬🇦', lat: 0.39, lng: 9.45, continent: 'Africa' },
  { name: 'Gambia', capital: 'Banjul', code: 'GM', flag: '🇬🇲', lat: 13.45, lng: -16.58, continent: 'Africa' },
  { name: 'Georgia', capital: 'Tbilisi', code: 'GE', flag: '🇬🇪', lat: 41.69, lng: 44.83, continent: 'Asia' },
  { name: 'Germany', capital: 'Berlin', code: 'DE', flag: '🇩🇪', lat: 52.52, lng: 13.41, continent: 'Europe' },
  { name: 'Ghana', capital: 'Accra', code: 'GH', flag: '🇬🇭', lat: 5.56, lng: -0.19, continent: 'Africa' },
  { name: 'Greece', capital: 'Athens', code: 'GR', flag: '🇬🇷', lat: 37.98, lng: 23.73, continent: 'Europe' },
  { name: 'Grenada', capital: "St. George's", code: 'GD', flag: '🇬🇩', lat: 12.06, lng: -61.75, continent: 'North America' },
  { name: 'Guatemala', capital: 'Guatemala City', code: 'GT', flag: '🇬🇹', lat: 14.63, lng: -90.51, continent: 'North America' },
  { name: 'Guinea', capital: 'Conakry', code: 'GN', flag: '🇬🇳', lat: 9.64, lng: -13.58, continent: 'Africa' },
  { name: 'Guinea-Bissau', capital: 'Bissau', code: 'GW', flag: '🇬🇼', lat: 11.86, lng: -15.6, continent: 'Africa' },
  { name: 'Guyana', capital: 'Georgetown', code: 'GY', flag: '🇬🇾', lat: 6.8, lng: -58.16, continent: 'South America' },
  { name: 'Haiti', capital: 'Port-au-Prince', code: 'HT', flag: '🇭🇹', lat: 18.54, lng: -72.34, continent: 'North America' },
  { name: 'Honduras', capital: 'Tegucigalpa', code: 'HN', flag: '🇭🇳', lat: 14.07, lng: -87.19, continent: 'North America' },
  { name: 'Hungary', capital: 'Budapest', code: 'HU', flag: '🇭🇺', lat: 47.5, lng: 19.04, continent: 'Europe' },
  { name: 'Iceland', capital: 'Reykjavik', code: 'IS', flag: '🇮🇸', lat: 64.15, lng: -21.94, continent: 'Europe' },
  { name: 'India', capital: 'New Delhi', code: 'IN', flag: '🇮🇳', lat: 28.61, lng: 77.21, continent: 'Asia' },
  { name: 'Indonesia', capital: 'Jakarta', code: 'ID', flag: '🇮🇩', lat: -6.21, lng: 106.85, continent: 'Asia' },
  { name: 'Iran', capital: 'Tehran', code: 'IR', flag: '🇮🇷', lat: 35.69, lng: 51.39, continent: 'Asia' },
  { name: 'Iraq', capital: 'Baghdad', code: 'IQ', flag: '🇮🇶', lat: 33.31, lng: 44.37, continent: 'Asia' },
  { name: 'Ireland', capital: 'Dublin', code: 'IE', flag: '🇮🇪', lat: 53.35, lng: -6.26, continent: 'Europe' },
  { name: 'Israel', capital: 'Jerusalem', code: 'IL', flag: '🇮🇱', lat: 31.77, lng: 35.22, continent: 'Asia' },
  { name: 'Italy', capital: 'Rome', code: 'IT', flag: '🇮🇹', lat: 41.9, lng: 12.5, continent: 'Europe' },
  { name: 'Jamaica', capital: 'Kingston', code: 'JM', flag: '🇯🇲', lat: 18.0, lng: -76.79, continent: 'North America' },
  { name: 'Japan', capital: 'Tokyo', code: 'JP', flag: '🇯🇵', lat: 35.68, lng: 139.69, continent: 'Asia' },
  { name: 'Jordan', capital: 'Amman', code: 'JO', flag: '🇯🇴', lat: 31.95, lng: 35.93, continent: 'Asia' },
  { name: 'Kazakhstan', capital: 'Astana', code: 'KZ', flag: '🇰🇿', lat: 51.13, lng: 71.43, continent: 'Asia' },
  { name: 'Kenya', capital: 'Nairobi', code: 'KE', flag: '🇰🇪', lat: -1.29, lng: 36.82, continent: 'Africa' },
  { name: 'Kiribati', capital: 'Tarawa', code: 'KI', flag: '🇰🇮', lat: 1.45, lng: 173.0, continent: 'Oceania' },
  { name: 'Kuwait', capital: 'Kuwait City', code: 'KW', flag: '🇰🇼', lat: 29.38, lng: 47.99, continent: 'Asia' },
  { name: 'Kyrgyzstan', capital: 'Bishkek', code: 'KG', flag: '🇰🇬', lat: 42.87, lng: 74.59, continent: 'Asia' },
  { name: 'Laos', capital: 'Vientiane', code: 'LA', flag: '🇱🇦', lat: 17.97, lng: 102.63, continent: 'Asia' },
  { name: 'Latvia', capital: 'Riga', code: 'LV', flag: '🇱🇻', lat: 56.95, lng: 24.11, continent: 'Europe' },
  { name: 'Lebanon', capital: 'Beirut', code: 'LB', flag: '🇱🇧', lat: 33.89, lng: 35.5, continent: 'Asia' },
  { name: 'Lesotho', capital: 'Maseru', code: 'LS', flag: '🇱🇸', lat: -29.31, lng: 27.48, continent: 'Africa' },
  { name: 'Liberia', capital: 'Monrovia', code: 'LR', flag: '🇱🇷', lat: 6.3, lng: -10.8, continent: 'Africa' },
  { name: 'Libya', capital: 'Tripoli', code: 'LY', flag: '🇱🇾', lat: 32.9, lng: 13.18, continent: 'Africa' },
  { name: 'Liechtenstein', capital: 'Vaduz', code: 'LI', flag: '🇱🇮', lat: 47.14, lng: 9.52, continent: 'Europe' },
  { name: 'Lithuania', capital: 'Vilnius', code: 'LT', flag: '🇱🇹', lat: 54.69, lng: 25.28, continent: 'Europe' },
  { name: 'Luxembourg', capital: 'Luxembourg', code: 'LU', flag: '🇱🇺', lat: 49.61, lng: 6.13, continent: 'Europe' },
  { name: 'Madagascar', capital: 'Antananarivo', code: 'MG', flag: '🇲🇬', lat: -18.92, lng: 47.52, continent: 'Africa' },
  { name: 'Malawi', capital: 'Lilongwe', code: 'MW', flag: '🇲🇼', lat: -13.97, lng: 33.79, continent: 'Africa' },
  { name: 'Malaysia', capital: 'Kuala Lumpur', code: 'MY', flag: '🇲🇾', lat: 3.14, lng: 101.69, continent: 'Asia' },
  { name: 'Maldives', capital: 'Malé', code: 'MV', flag: '🇲🇻', lat: 4.18, lng: 73.51, continent: 'Asia' },
  { name: 'Mali', capital: 'Bamako', code: 'ML', flag: '🇲🇱', lat: 12.65, lng: -8.0, continent: 'Africa' },
  { name: 'Malta', capital: 'Valletta', code: 'MT', flag: '🇲🇹', lat: 35.9, lng: 14.51, continent: 'Europe' },
  { name: 'Marshall Islands', capital: 'Majuro', code: 'MH', flag: '🇲🇭', lat: 7.09, lng: 171.38, continent: 'Oceania' },
  { name: 'Mauritania', capital: 'Nouakchott', code: 'MR', flag: '🇲🇷', lat: 18.09, lng: -15.98, continent: 'Africa' },
  { name: 'Mauritius', capital: 'Port Louis', code: 'MU', flag: '🇲🇺', lat: -20.16, lng: 57.5, continent: 'Africa' },
  { name: 'Mexico', capital: 'Mexico City', code: 'MX', flag: '🇲🇽', lat: 19.43, lng: -99.13, continent: 'North America' },
  { name: 'Micronesia', capital: 'Palikir', code: 'FM', flag: '🇫🇲', lat: 6.91, lng: 158.16, continent: 'Oceania' },
  { name: 'Moldova', capital: 'Chișinău', code: 'MD', flag: '🇲🇩', lat: 47.01, lng: 28.86, continent: 'Europe' },
  { name: 'Monaco', capital: 'Monaco', code: 'MC', flag: '🇲🇨', lat: 43.73, lng: 7.42, continent: 'Europe' },
  { name: 'Mongolia', capital: 'Ulaanbaatar', code: 'MN', flag: '🇲🇳', lat: 47.92, lng: 106.92, continent: 'Asia' },
  { name: 'Montenegro', capital: 'Podgorica', code: 'ME', flag: '🇲🇪', lat: 42.44, lng: 19.26, continent: 'Europe' },
  { name: 'Morocco', capital: 'Rabat', code: 'MA', flag: '🇲🇦', lat: 34.02, lng: -6.84, continent: 'Africa' },
  { name: 'Mozambique', capital: 'Maputo', code: 'MZ', flag: '🇲🇿', lat: -25.97, lng: 32.57, continent: 'Africa' },
  { name: 'Myanmar', capital: 'Naypyidaw', code: 'MM', flag: '🇲🇲', lat: 19.76, lng: 96.07, continent: 'Asia' },
  { name: 'Namibia', capital: 'Windhoek', code: 'NA', flag: '🇳🇦', lat: -22.57, lng: 17.08, continent: 'Africa' },
  { name: 'Nauru', capital: 'Yaren', code: 'NR', flag: '🇳🇷', lat: -0.55, lng: 166.92, continent: 'Oceania' },
  { name: 'Nepal', capital: 'Kathmandu', code: 'NP', flag: '🇳🇵', lat: 27.72, lng: 85.32, continent: 'Asia' },
  { name: 'Netherlands', capital: 'Amsterdam', code: 'NL', flag: '🇳🇱', lat: 52.37, lng: 4.9, continent: 'Europe' },
  { name: 'New Zealand', capital: 'Wellington', code: 'NZ', flag: '🇳🇿', lat: -41.29, lng: 174.78, continent: 'Oceania' },
  { name: 'Nicaragua', capital: 'Managua', code: 'NI', flag: '🇳🇮', lat: 12.15, lng: -86.27, continent: 'North America' },
  { name: 'Niger', capital: 'Niamey', code: 'NE', flag: '🇳🇪', lat: 13.51, lng: 2.11, continent: 'Africa' },
  { name: 'Nigeria', capital: 'Abuja', code: 'NG', flag: '🇳🇬', lat: 9.06, lng: 7.49, continent: 'Africa' },
  { name: 'North Korea', capital: 'Pyongyang', code: 'KP', flag: '🇰🇵', lat: 39.02, lng: 125.75, continent: 'Asia' },
  { name: 'North Macedonia', capital: 'Skopje', code: 'MK', flag: '🇲🇰', lat: 42.0, lng: 21.43, continent: 'Europe' },
  { name: 'Norway', capital: 'Oslo', code: 'NO', flag: '🇳🇴', lat: 59.91, lng: 10.75, continent: 'Europe' },
  { name: 'Oman', capital: 'Muscat', code: 'OM', flag: '🇴🇲', lat: 23.59, lng: 58.54, continent: 'Asia' },
  { name: 'Pakistan', capital: 'Islamabad', code: 'PK', flag: '🇵🇰', lat: 33.69, lng: 73.04, continent: 'Asia' },
  { name: 'Palau', capital: 'Ngerulmud', code: 'PW', flag: '🇵🇼', lat: 7.5, lng: 134.62, continent: 'Oceania' },
  { name: 'Palestine', capital: 'Ramallah', code: 'PS', flag: '🇵🇸', lat: 31.9, lng: 35.2, continent: 'Asia' },
  { name: 'Panama', capital: 'Panama City', code: 'PA', flag: '🇵🇦', lat: 8.98, lng: -79.52, continent: 'North America' },
  { name: 'Papua New Guinea', capital: 'Port Moresby', code: 'PG', flag: '🇵🇬', lat: -9.44, lng: 147.18, continent: 'Oceania' },
  { name: 'Paraguay', capital: 'Asunción', code: 'PY', flag: '🇵🇾', lat: -25.26, lng: -57.58, continent: 'South America' },
  { name: 'Peru', capital: 'Lima', code: 'PE', flag: '🇵🇪', lat: -12.05, lng: -77.04, continent: 'South America' },
  { name: 'Philippines', capital: 'Manila', code: 'PH', flag: '🇵🇭', lat: 14.6, lng: 120.98, continent: 'Asia' },
  { name: 'Poland', capital: 'Warsaw', code: 'PL', flag: '🇵🇱', lat: 52.23, lng: 21.01, continent: 'Europe' },
  { name: 'Portugal', capital: 'Lisbon', code: 'PT', flag: '🇵🇹', lat: 38.72, lng: -9.14, continent: 'Europe' },
  { name: 'Qatar', capital: 'Doha', code: 'QA', flag: '🇶🇦', lat: 25.29, lng: 51.53, continent: 'Asia' },
  { name: 'Romania', capital: 'Bucharest', code: 'RO', flag: '🇷🇴', lat: 44.43, lng: 26.1, continent: 'Europe' },
  { name: 'Russia', capital: 'Moscow', code: 'RU', flag: '🇷🇺', lat: 55.76, lng: 37.62, continent: 'Europe' },
  { name: 'Rwanda', capital: 'Kigali', code: 'RW', flag: '🇷🇼', lat: -1.94, lng: 29.87, continent: 'Africa' },
  { name: 'Saint Kitts and Nevis', capital: 'Basseterre', code: 'KN', flag: '🇰🇳', lat: 17.3, lng: -62.73, continent: 'North America' },
  { name: 'Saint Lucia', capital: 'Castries', code: 'LC', flag: '🇱🇨', lat: 14.01, lng: -60.99, continent: 'North America' },
  { name: 'Saint Vincent and the Grenadines', capital: 'Kingstown', code: 'VC', flag: '🇻🇨', lat: 13.16, lng: -61.23, continent: 'North America' },
  { name: 'Samoa', capital: 'Apia', code: 'WS', flag: '🇼🇸', lat: -13.83, lng: -171.76, continent: 'Oceania' },
  { name: 'San Marino', capital: 'San Marino', code: 'SM', flag: '🇸🇲', lat: 43.94, lng: 12.46, continent: 'Europe' },
  { name: 'São Tomé and Príncipe', capital: 'São Tomé', code: 'ST', flag: '🇸🇹', lat: 0.19, lng: 6.61, continent: 'Africa' },
  { name: 'Saudi Arabia', capital: 'Riyadh', code: 'SA', flag: '🇸🇦', lat: 24.69, lng: 46.72, continent: 'Asia' },
  { name: 'Senegal', capital: 'Dakar', code: 'SN', flag: '🇸🇳', lat: 14.69, lng: -17.44, continent: 'Africa' },
  { name: 'Serbia', capital: 'Belgrade', code: 'RS', flag: '🇷🇸', lat: 44.79, lng: 20.47, continent: 'Europe' },
  { name: 'Seychelles', capital: 'Victoria', code: 'SC', flag: '🇸🇨', lat: -4.62, lng: 55.45, continent: 'Africa' },
  { name: 'Sierra Leone', capital: 'Freetown', code: 'SL', flag: '🇸🇱', lat: 8.48, lng: -13.23, continent: 'Africa' },
  { name: 'Singapore', capital: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.35, lng: 103.82, continent: 'Asia' },
  { name: 'Slovakia', capital: 'Bratislava', code: 'SK', flag: '🇸🇰', lat: 48.15, lng: 17.11, continent: 'Europe' },
  { name: 'Slovenia', capital: 'Ljubljana', code: 'SI', flag: '🇸🇮', lat: 46.06, lng: 14.51, continent: 'Europe' },
  { name: 'Solomon Islands', capital: 'Honiara', code: 'SB', flag: '🇸🇧', lat: -9.43, lng: 160.0, continent: 'Oceania' },
  { name: 'Somalia', capital: 'Mogadishu', code: 'SO', flag: '🇸🇴', lat: 2.05, lng: 45.32, continent: 'Africa' },
  { name: 'South Africa', capital: 'Pretoria', code: 'ZA', flag: '🇿🇦', lat: -25.75, lng: 28.19, continent: 'Africa' },
  { name: 'South Korea', capital: 'Seoul', code: 'KR', flag: '🇰🇷', lat: 37.57, lng: 126.98, continent: 'Asia' },
  { name: 'South Sudan', capital: 'Juba', code: 'SS', flag: '🇸🇸', lat: 4.85, lng: 31.58, continent: 'Africa' },
  { name: 'Spain', capital: 'Madrid', code: 'ES', flag: '🇪🇸', lat: 40.42, lng: -3.7, continent: 'Europe' },
  { name: 'Sri Lanka', capital: 'Sri Jayawardenepura Kotte', code: 'LK', flag: '🇱🇰', lat: 6.93, lng: 79.85, continent: 'Asia' },
  { name: 'Sudan', capital: 'Khartoum', code: 'SD', flag: '🇸🇩', lat: 15.5, lng: 32.56, continent: 'Africa' },
  { name: 'Suriname', capital: 'Paramaribo', code: 'SR', flag: '🇸🇷', lat: 5.87, lng: -55.17, continent: 'South America' },
  { name: 'Sweden', capital: 'Stockholm', code: 'SE', flag: '🇸🇪', lat: 59.33, lng: 18.07, continent: 'Europe' },
  { name: 'Switzerland', capital: 'Bern', code: 'CH', flag: '🇨🇭', lat: 46.95, lng: 7.45, continent: 'Europe' },
  { name: 'Syria', capital: 'Damascus', code: 'SY', flag: '🇸🇾', lat: 33.51, lng: 36.29, continent: 'Asia' },
  { name: 'Taiwan', capital: 'Taipei', code: 'TW', flag: '🇹🇼', lat: 25.03, lng: 121.57, continent: 'Asia' },
  { name: 'Tajikistan', capital: 'Dushanbe', code: 'TJ', flag: '🇹🇯', lat: 38.56, lng: 68.77, continent: 'Asia' },
  { name: 'Tanzania', capital: 'Dodoma', code: 'TZ', flag: '🇹🇿', lat: -6.16, lng: 35.75, continent: 'Africa' },
  { name: 'Thailand', capital: 'Bangkok', code: 'TH', flag: '🇹🇭', lat: 13.76, lng: 100.5, continent: 'Asia' },
  { name: 'Timor-Leste', capital: 'Dili', code: 'TL', flag: '🇹🇱', lat: -8.56, lng: 125.57, continent: 'Asia' },
  { name: 'Togo', capital: 'Lomé', code: 'TG', flag: '🇹🇬', lat: 6.14, lng: 1.21, continent: 'Africa' },
  { name: 'Tonga', capital: "Nuku'alofa", code: 'TO', flag: '🇹🇴', lat: -21.21, lng: -175.2, continent: 'Oceania' },
  { name: 'Trinidad and Tobago', capital: 'Port of Spain', code: 'TT', flag: '🇹🇹', lat: 10.66, lng: -61.51, continent: 'North America' },
  { name: 'Tunisia', capital: 'Tunis', code: 'TN', flag: '🇹🇳', lat: 36.81, lng: 10.17, continent: 'Africa' },
  { name: 'Turkey', capital: 'Ankara', code: 'TR', flag: '🇹🇷', lat: 39.93, lng: 32.85, continent: 'Asia' },
  { name: 'Turkmenistan', capital: 'Ashgabat', code: 'TM', flag: '🇹🇲', lat: 37.96, lng: 58.33, continent: 'Asia' },
  { name: 'Tuvalu', capital: 'Funafuti', code: 'TV', flag: '🇹🇻', lat: -8.52, lng: 179.2, continent: 'Oceania' },
  { name: 'Uganda', capital: 'Kampala', code: 'UG', flag: '🇺🇬', lat: 0.35, lng: 32.58, continent: 'Africa' },
  { name: 'Ukraine', capital: 'Kyiv', code: 'UA', flag: '🇺🇦', lat: 50.45, lng: 30.52, continent: 'Europe' },
  { name: 'United Arab Emirates', capital: 'Abu Dhabi', code: 'AE', flag: '🇦🇪', lat: 24.45, lng: 54.65, continent: 'Asia' },
  { name: 'United Kingdom', capital: 'London', code: 'GB', flag: '🇬🇧', lat: 51.51, lng: -0.13, continent: 'Europe' },
  { name: 'United States', capital: 'Washington, D.C.', code: 'US', flag: '🇺🇸', lat: 38.91, lng: -77.04, continent: 'North America' },
  { name: 'Uruguay', capital: 'Montevideo', code: 'UY', flag: '🇺🇾', lat: -34.88, lng: -56.17, continent: 'South America' },
  { name: 'Uzbekistan', capital: 'Tashkent', code: 'UZ', flag: '🇺🇿', lat: 41.3, lng: 69.28, continent: 'Asia' },
  { name: 'Vanuatu', capital: 'Port Vila', code: 'VU', flag: '🇻🇺', lat: -17.73, lng: 168.32, continent: 'Oceania' },
  { name: 'Vatican City', capital: 'Vatican City', code: 'VA', flag: '🇻🇦', lat: 41.9, lng: 12.45, continent: 'Europe' },
  { name: 'Venezuela', capital: 'Caracas', code: 'VE', flag: '🇻🇪', lat: 10.49, lng: -66.88, continent: 'South America' },
  { name: 'Vietnam', capital: 'Hanoi', code: 'VN', flag: '🇻🇳', lat: 21.03, lng: 105.85, continent: 'Asia' },
  { name: 'Yemen', capital: "Sana'a", code: 'YE', flag: '🇾🇪', lat: 15.37, lng: 44.21, continent: 'Asia' },
  { name: 'Zambia', capital: 'Lusaka', code: 'ZM', flag: '🇿🇲', lat: -15.39, lng: 28.32, continent: 'Africa' },
  { name: 'Zimbabwe', capital: 'Harare', code: 'ZW', flag: '🇿🇼', lat: -17.83, lng: 31.05, continent: 'Africa' },
];

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...(array ?? [])];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface Question {
  type: 'capital' | 'country_from_capital' | 'map_guess' | 'flag';
  questionText: string;
  correctAnswer: string;
  options: string[];
  countryCode?: string;
  lat?: number;
  lng?: number;
}

export function generateFlagQuestions(count: number, countries: Country[] = COUNTRIES): Question[] {
  return shuffleArray(countries).slice(0, Math.min(count, countries.length)).map((country) => ({ type: 'flag', questionText: 'Which country does this flag belong to?', correctAnswer: country.name, options: [], countryCode: country.code }));
}

export function generateCapitalQuestions(count: number, countries: Country[] = COUNTRIES): Question[] {
  const shuffled = shuffleArray(countries);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const country = shuffled[i];
    const wrongAnswers = shuffleArray(
      countries.filter((c: Country) => c.code !== country.code)
    )
      .slice(0, 3)
      .map((c: Country) => c.capital);

    questions.push({
      type: 'capital',
      questionText: `What is the capital of ${country.name}?`,
      correctAnswer: country.capital,
      options: shuffleArray([country.capital, ...wrongAnswers]),
      countryCode: country.code,
    });
  }

  return questions;
}

export function generateMixQuestions(count: number, countries: Country[] = COUNTRIES): Question[] {
  const shuffled = shuffleArray(countries);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const country = shuffled[i];
    const isCapitalQ = Math.random() > 0.5;

    if (isCapitalQ) {
      const wrongAnswers = shuffleArray(
        countries.filter((c: Country) => c.code !== country.code)
      )
        .slice(0, 3)
        .map((c: Country) => c.capital);

      questions.push({
        type: 'capital',
        questionText: `What is the capital of ${country.name}?`,
        correctAnswer: country.capital,
        options: shuffleArray([country.capital, ...wrongAnswers]),
        countryCode: country.code,
      });
    } else {
      const wrongAnswers = shuffleArray(
        countries.filter((c: Country) => c.code !== country.code)
      )
        .slice(0, 3)
        .map((c: Country) => c.name);

      questions.push({
        type: 'country_from_capital',
        questionText: `Which country has the capital ${country.capital}?`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...wrongAnswers]),
        countryCode: country.code,
      });
    }
  }

  return questions;
}

export function generateMapQuestions(count: number, countries: Country[] = COUNTRIES): Question[] {
  const shuffled = shuffleArray(countries);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const country = shuffled[i];
    const wrongAnswers = shuffleArray(
      countries.filter((c: Country) => c.code !== country.code)
    )
      .slice(0, 3)
      .map((c: Country) => c.name);

    questions.push({
      type: 'map_guess',
      questionText: `Which country is marked on the map?`,
      correctAnswer: country.name,
      options: shuffleArray([country.name, ...wrongAnswers]),
      countryCode: country.code,
      lat: country.lat,
      lng: country.lng,
    });
  }

  return questions;
}
