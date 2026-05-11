export const getInitials = (full_name: string): string => {
  const arrayOfWords = full_name.split(" ")
  return arrayOfWords[0][0] + arrayOfWords[1][0]
} 

export const getCasualName = (full_name: string): string => {
  const arrayOfWords = full_name.split(" ")
  return `${arrayOfWords[1]} ${arrayOfWords[0]}`
}