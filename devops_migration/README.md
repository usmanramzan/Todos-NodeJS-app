# POSTGRES schema migration application
This application would update the schema of the production database.

## Description

The repo comes with a helper script for executing migration steps: `migrate.js`.  It
supports the following commands:
- `init`: Initialize the base schema placed in the repo in `init.sql` file.
- `status`: Print current migration status.
- `up`: Executed all unexecuted migrations.
- `down`: Revert all executed migrations.
- `next`: Execute the next pending migration.
- `prev`: Revert the previous executed migration.
- `reset-hard`: Reset the database using a `dropdb`/`createdb` postgres command.
- `up-name`: Run specific migration.
- `down-name`: Undo specific migration.
- `down-to-name`: Undo till specific migration including the provided.

Execute a command via:

```shell
node ./migrate.js <command>
```

