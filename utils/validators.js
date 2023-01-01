const validateUser = (body) => {
    const { username, age, hobbies } = body;
    if (!username || !age || !hobbies) return false;
    if (!Array.isArray(hobbies)) return false;
    return true;
}

module.exports = {
    validateUser
}