import { seedAll } from "../../scripts/seedAll";
import { seedUsers } from "./users.seed";

seedAll(
    [
        seedUsers
    ]
);
