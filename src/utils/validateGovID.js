// Jumio, Trulioo, or Onfido
// Tesseract

// TODO: Two Things todo
// => Check If the document is Valid
// => Extract the required texts
import Tesseract from "tesseract.js";

export function checkAuthenticityAndExtractTextsFromDocs(file) {
    try {
        // Check If the document is Valid
        const checkAuthenticityResponse = checkAuthenticity(file);

        if (checkAuthenticityResponse) {
            // Extract the required texts
            const extractTexts = extractTextsFromDocs(file);
            const finalDataFromFile = { ...extractTexts, success: true };
            return finalDataFromFile;
        } else {
            let failedData = {
                data: null,
                status: 0,
                success: false,
            };
            console.log(failedData);
            return failedData;
        }
    } catch (error) {
        return false;
    }
}

function checkAuthenticity(file) {
    return true;
}

function extractTextsFromDocs(file) {
    Tesseract.recognize("./src/utils/1.6billiondollar.png", "eng", {
        logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
        console.log(text);
    });
}
console.log(extractTextsFromDocs("./04-nextjs14(1).png"));
