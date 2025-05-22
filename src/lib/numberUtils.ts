// Helper: is palindrome
export function isPalindrome(n: number): boolean {
  const s = n.toString();
  return s === s.split('').reverse().join('');
}

// Helper: is mathematically interesting (e.g., sequential like 12345, 23456)
export function isInterestingNumber(n: number): boolean {
  const s = n.toString();
  // Check for increasing sequence
  let inc = true, dec = true;
  for (let i = 1; i < s.length; i++) {
    if (parseInt(s[i]) !== parseInt(s[i-1]) + 1) inc = false;
    if (parseInt(s[i]) !== parseInt(s[i-1]) - 1) dec = false;
  }
  return inc || dec;
} 