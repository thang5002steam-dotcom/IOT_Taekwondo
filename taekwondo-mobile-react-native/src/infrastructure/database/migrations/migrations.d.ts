type MigrationJournal = {
  entries: {
    idx: number;
    when: number;
    tag: string;
    breakpoints: boolean;
  }[];
};

declare const migrations: {
  journal: MigrationJournal;
  migrations: Record<string, string>;
};

export default migrations;
