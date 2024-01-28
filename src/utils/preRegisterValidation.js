// check image file extensions

import {
    mimeTypesOfRegistrationFile,
    recommendedFileSize,
} from "../constants/preRegisterUserFileValidateOptions.js";

export function preRegisterationValidationExtensions(file) {
    const fileType = file?.mimetype;
    const allMimeTypes = mimeTypesOfRegistrationFile.includes(fileType);
    return allMimeTypes;
}

// check image file size not greater than 15 mb
export function preRegisterationValidationSize(file) {
    const fileSize = file?.size;
    if (fileSize > recommendedFileSize) {
        // throw an Error prompting the file size is greater than recommended file size
        return false;
    }
    return true;
}
