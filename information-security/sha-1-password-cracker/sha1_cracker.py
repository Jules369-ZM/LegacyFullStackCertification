#!/usr/bin/env python3
"""
SHA-1 Password Cracker - Educational demonstration of password security
WARNING: This is for educational purposes only. Do not use for malicious activities.
"""

import hashlib
import itertools
import string
import time
import argparse


def hash_password(password, algorithm='sha1'):
    """
    Hash a password using the specified algorithm.

    Args:
        password (str): Password to hash
        algorithm (str): Hash algorithm ('sha1', 'md5', etc.)

    Returns:
        str: Hexadecimal hash string
    """
    if algorithm.lower() == 'sha1':
        return hashlib.sha1(password.encode()).hexdigest()
    elif algorithm.lower() == 'md5':
        return hashlib.md5(password.encode()).hexdigest()
    else:
        raise ValueError(f"Unsupported hash algorithm: {algorithm}")


def generate_wordlist(min_length=1, max_length=8, charset=None):
    """
    Generate all possible combinations of characters.

    Args:
        min_length (int): Minimum password length
        max_length (int): Maximum password length
        charset (str): Character set to use

    Yields:
        str: Generated password
    """
    if charset is None:
        # Default charset: lowercase letters
        charset = string.ascii_lowercase

    for length in range(min_length, max_length + 1):
        for combination in itertools.product(charset, repeat=length):
            yield ''.join(combination)


def dictionary_attack(target_hash, wordlist_file, algorithm='sha1'):
    """
    Perform dictionary attack using a wordlist file.

    Args:
        target_hash (str): Target hash to crack
        wordlist_file (str): Path to wordlist file
        algorithm (str): Hash algorithm to use

    Returns:
        tuple: (password, attempts) or (None, attempts) if not found
    """
    attempts = 0

    try:
        with open(wordlist_file, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                password = line.strip()
                attempts += 1

                if hash_password(password, algorithm) == target_hash:
                    return password, attempts

                # Progress indicator
                if attempts % 10000 == 0:
                    print(f"Checked {attempts} passwords...")

    except FileNotFoundError:
        print(f"Wordlist file not found: {wordlist_file}")
        return None, attempts

    return None, attempts


def brute_force_attack(target_hash, max_length=6, charset=None, algorithm='sha1'):
    """
    Perform brute force attack.

    Args:
        target_hash (str): Target hash to crack
        max_length (int): Maximum password length to try
        charset (str): Character set to use
        algorithm (str): Hash algorithm to use

    Returns:
        tuple: (password, attempts) or (None, attempts) if not found
    """
    if charset is None:
        # Simple charset for demonstration
        charset = string.ascii_lowercase + string.digits

    attempts = 0

    print(f"Starting brute force attack...")
    print(f"Charset: {charset}")
    print(f"Max length: {max_length}")
    print(f"Total combinations: {sum(len(charset) ** i for i in range(1, max_length + 1))}")

    for password in generate_wordlist(1, max_length, charset):
        attempts += 1

        if hash_password(password, algorithm) == target_hash:
            return password, attempts

        # Progress indicator
        if attempts % 100000 == 0:
            print(f"Checked {attempts} passwords... Last tried: {password}")

    return None, attempts


def hybrid_attack(target_hash, wordlist_file, max_length=2, charset=None, algorithm='sha1'):
    """
    Perform hybrid attack combining dictionary and brute force.

    Args:
        target_hash (str): Target hash to crack
        wordlist_file (str): Path to wordlist file
        max_length (int): Maximum length for mutations
        charset (str): Character set for mutations
        algorithm (str): Hash algorithm to use

    Returns:
        tuple: (password, attempts) or (None, attempts) if not found
    """
    if charset is None:
        charset = string.digits

    attempts = 0

    try:
        with open(wordlist_file, 'r', encoding='utf-8', errors='ignore') as f:
            base_words = [line.strip() for line in f if line.strip()]

    except FileNotFoundError:
        print(f"Wordlist file not found: {wordlist_file}")
        return None, attempts

    print(f"Loaded {len(base_words)} base words for hybrid attack")

    # Try base words first
    for word in base_words:
        attempts += 1
        if hash_password(word, algorithm) == target_hash:
            return word, attempts

    # Generate mutations
    for word in base_words:
        for mutation in generate_mutations(word, max_length, charset):
            attempts += 1

            if hash_password(mutation, algorithm) == target_hash:
                return mutation, attempts

            if attempts % 10000 == 0:
                print(f"Checked {attempts} passwords... Last tried: {mutation}")

    return None, attempts


def generate_mutations(base_word, max_suffix_length, charset):
    """
    Generate mutations of a base word.

    Args:
        base_word (str): Base word to mutate
        max_suffix_length (int): Maximum length of suffix to add
        charset (str): Character set for suffix

    Yields:
        str: Mutated password
    """
    # Add suffixes
    for length in range(1, max_suffix_length + 1):
        for suffix in itertools.product(charset, repeat=length):
            yield base_word + ''.join(suffix)

    # Add prefixes
    for length in range(1, max_suffix_length + 1):
        for prefix in itertools.product(charset, repeat=length):
            yield ''.join(prefix) + base_word


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='SHA-1 Password Cracker (Educational)')
    parser.add_argument('hash', help='Target hash to crack')
    parser.add_argument('-a', '--algorithm', default='sha1', choices=['sha1', 'md5'],
                       help='Hash algorithm (default: sha1)')
    parser.add_argument('-m', '--method', default='brute',
                       choices=['brute', 'dict', 'hybrid'],
                       help='Cracking method (default: brute)')
    parser.add_argument('-w', '--wordlist', help='Wordlist file for dictionary/hybrid attack')
    parser.add_argument('-l', '--max-length', type=int, default=4,
                       help='Maximum password length for brute force (default: 4)')
    parser.add_argument('-c', '--charset', default=string.ascii_lowercase + string.digits,
                       help='Character set for brute force')

    args = parser.parse_args()

    print("=" * 60)
    print("SHA-1 Password Cracker (Educational Purpose Only)")
    print("=" * 60)
    print(f"Target hash: {args.hash}")
    print(f"Algorithm: {args.algorithm}")
    print(f"Method: {args.method}")
    print()

    start_time = time.time()

    if args.method == 'dict':
        if not args.wordlist:
            print("Error: Wordlist file required for dictionary attack")
            return 1
        password, attempts = dictionary_attack(args.hash, args.wordlist, args.algorithm)

    elif args.method == 'hybrid':
        if not args.wordlist:
            print("Error: Wordlist file required for hybrid attack")
            return 1
        password, attempts = hybrid_attack(args.hash, args.wordlist, args.max_length, args.charset, args.algorithm)

    else:  # brute force
        password, attempts = brute_force_attack(args.hash, args.max_length, args.charset, args.algorithm)

    elapsed_time = time.time() - start_time

    print("\n" + "=" * 60)
    if password:
        print(f"✅ PASSWORD FOUND: {password}")
    else:
        print("❌ Password not found")
    print(f"Attempts: {attempts}")
    print(".2f")
    print(".2f")

    # Security warning
    print("\n" + "!" * 60)
    print("SECURITY WARNING:")
    print("This tool is for educational purposes only.")
    print("Cracking passwords without authorization is illegal.")
    print("Always use strong, unique passwords and proper security practices.")
    print("!" * 60)

    return 0 if password else 1


if __name__ == '__main__':
    exit(main())
