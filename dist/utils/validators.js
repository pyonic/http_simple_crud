"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = void 0;
const validateUser = (body) => {
    const { username, age, hobbies } = body;
    if (!username || !age || !hobbies)
        return false;
    if (!Array.isArray(hobbies))
        return false;
    return true;
};
exports.validateUser = validateUser;
