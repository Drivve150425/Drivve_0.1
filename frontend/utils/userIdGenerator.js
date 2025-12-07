/**
 * Generate DRIVVE User ID: D-{FirstInitial}{LastInitial}{Last4Digits}
 * Examples: Aman Jain, +919990468600 → D-AJ8600
 *           Lakshay (no last name), +919990468600 → D-LX8600
 */
export const generateUserId = (firstName, lastName, phoneNumber) => {
  try {
    const firstInitial = firstName && firstName.length > 0 
      ? firstName.charAt(0).toUpperCase() 
      : 'D';
    
    const lastInitial = lastName && lastName.length > 0 
      ? lastName.charAt(0).toUpperCase() 
      : 'X';
    
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const lastFourDigits = digitsOnly.slice(-4);
    
    const userId = `D-${firstInitial}${lastInitial}${lastFourDigits}`;
    
    console.log('✅ Generated User ID:', userId);
    return userId;
    
  } catch (error) {
    console.error('❌ Error generating User ID:', error);
    return `D-XX${Date.now().toString().slice(-4)}`;
  }
};

export const validateUserId = (userId) => {
  const pattern = /^D-[A-Z]{2}\d{4}$/;
  return pattern.test(userId);
};
