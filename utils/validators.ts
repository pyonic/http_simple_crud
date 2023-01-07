import { User } from "../controllers/User";

const validateUser = (body: User) => {
    const { username, age, hobbies } = body;
    if (!username || !age || !hobbies) return false;
    if (!Array.isArray(hobbies)) return false;
    return true;
}

export { validateUser }