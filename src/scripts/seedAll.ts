export async function seedAll(seedsFn: Function[]) {
    try {
        for (const fn of seedsFn) {
            const result = await fn();
            console.log(result);
        }

        console.log("All seeds done!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}