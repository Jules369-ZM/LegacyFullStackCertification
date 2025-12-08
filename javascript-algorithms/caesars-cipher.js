function rot13(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (let char of str) {
    if (alphabet.includes(char)) {
      // Find the index of the character in the alphabet
      const index = alphabet.indexOf(char);
      // Shift by 13 positions (ROT13)
      const newIndex = (index + 13) % 26;
      result += alphabet[newIndex];
    } else {
      // Keep non-alphabetic characters as they are
      result += char;
    }
  }

  return result;
}

// Test cases
console.log(rot13("SERR PBQR PNZC")); // FREE CODE CAMP
console.log(rot13("SERR CVMMN!")); // FREE PIZZA!
console.log(rot13("SERR YBIR?")); // FREE LOVE?
console.log(rot13("GUR DHVPX OEBJA SBK WHZCF BIRE GUR YNML QBT.")); // THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.
