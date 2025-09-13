// Hollow Knight Silksong Save File Decryptor
// Requires: crypto-js library for AES decryption

// Install crypto-js: npm install crypto-js
const CryptoJS = require('crypto-js');

class HollowKnightSaveDecryptor {
    constructor() {
        this.key = 'UKu52ePUBwetZ9wNX88o54dnfKRu0T1l';
    }

    // Extract Base64 string from BinaryFormatter data
    extractBase64FromBinaryFormatter(fileBytes) {
        // Convert bytes to string to find Base64 pattern
        const fileString = Buffer.from(fileBytes).toString('binary');
        
        // Look for Base64 pattern (starts with common JSON characters)
        const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/g;
        const matches = fileString.match(base64Pattern);
        
        if (matches && matches.length > 0) {
            // Find the longest Base64 string (likely the encrypted data)
            return matches.reduce((longest, current) => 
                current.length > longest.length ? current : longest
            );
        }
        
        throw new Error('Could not find Base64 data in BinaryFormatter file');
    }

    // Decrypt AES-ECB with PKCS7 padding
    decryptAES(base64String) {
        try {
            // Decode Base64
            const encryptedBytes = CryptoJS.enc.Base64.parse(base64String);
            
            // Create AES cipher in ECB mode
            const cipher = CryptoJS.AES.decrypt(
                { ciphertext: encryptedBytes },
                CryptoJS.enc.Utf8.parse(this.key),
                {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            // Convert to UTF-8 string
            return cipher.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error(`AES decryption failed: ${error.message}`);
        }
    }

    // Main decryption method
    decryptSaveFile(fileBytes) {
        try {
            console.log('Starting save file decryption...');
            
            // Step 1: Extract Base64 from BinaryFormatter
            console.log('Extracting Base64 from BinaryFormatter data...');
            const base64String = this.extractBase64FromBinaryFormatter(fileBytes);
            console.log(`Found Base64 string (${base64String.length} chars)`);
            
            // Step 2: Decrypt AES
            console.log('Decrypting AES-ECB...');
            const decryptedJson = this.decryptAES(base64String);
            console.log('Decryption successful!');
            
            return decryptedJson;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    // Encrypt save file (reverse process)
    encryptSaveFile(jsonString) {
        try {
            console.log('Starting save file encryption...');
            
            // Step 1: Encrypt with AES
            console.log('Encrypting with AES-ECB...');
            const encrypted = CryptoJS.AES.encrypt(
                jsonString,
                CryptoJS.enc.Utf8.parse(this.key),
                {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            const base64String = encrypted.toString();
            console.log(`Encrypted to Base64 (${base64String.length} chars)`);
            
            // Step 2: Create BinaryFormatter data
            console.log('Creating BinaryFormatter data...');
            const binaryData = this.createBinaryFormatterData(base64String);
            
            return binaryData;
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    // Create BinaryFormatter data (simplified version)
    createBinaryFormatterData(base64String) {
        // This is a simplified version - real BinaryFormatter is complex
        // For now, we'll just return the Base64 string as bytes
        return Buffer.from(base64String, 'utf8');
    }
}

// Usage example
async function decryptSaveFile(filePath) {
    const fs = require('fs');
    const decryptor = new HollowKnightSaveDecryptor();
    
    try {
        // Read the save file
        const fileBytes = fs.readFileSync(filePath);
        console.log(`Read ${fileBytes.length} bytes from ${filePath}`);
        
        // Decrypt the save file
        const decryptedJson = decryptor.decryptSaveFile(fileBytes);
        
        // Save decrypted JSON
        const outputPath = filePath.replace('.dat', '_decrypted.json');
        fs.writeFileSync(outputPath, decryptedJson, 'utf8');
        
        console.log(`Decrypted save file saved to: ${outputPath}`);
        return decryptedJson;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// Browser version (without Node.js dependencies)
class BrowserSaveDecryptor {
    constructor() {
        this.key = 'UKu52ePUBwetZ9wNX88o54dnfKRu0T1l';
    }

    async decryptSaveFile(fileBytes) {
        try {
            // Convert ArrayBuffer to Uint8Array
            const bytes = new Uint8Array(fileBytes);
            
            // Extract Base64 string
            const base64String = this.extractBase64FromBinaryFormatter(bytes);
            
            // Decrypt AES
            const decryptedJson = await this.decryptAES(base64String);
            
            return decryptedJson;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    extractBase64FromBinaryFormatter(fileBytes) {
        // Convert to string to find Base64 pattern
        let fileString = '';
        for (let i = 0; i < fileBytes.length; i++) {
            fileString += String.fromCharCode(fileBytes[i]);
        }
        
        // Look for Base64 pattern
        const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/g;
        const matches = fileString.match(base64Pattern);
        
        if (matches && matches.length > 0) {
            return matches.reduce((longest, current) => 
                current.length > longest.length ? current : longest
            );
        }
        
        throw new Error('Could not find Base64 data in BinaryFormatter file');
    }

    async decryptAES(base64String) {
        // Import crypto-js in browser
        const CryptoJS = window.CryptoJS;
        
        try {
            const encryptedBytes = CryptoJS.enc.Base64.parse(base64String);
            
            const cipher = CryptoJS.AES.decrypt(
                { ciphertext: encryptedBytes },
                CryptoJS.enc.Utf8.parse(this.key),
                {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            return cipher.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            throw new Error(`AES decryption failed: ${error.message}`);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HollowKnightSaveDecryptor, BrowserSaveDecryptor };
}

