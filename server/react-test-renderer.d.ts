declare module "react-test-renderer" {
  export function create(element: React.ReactElement): {
    toJSON(): unknown;
    root: {
      findAll(predicate: (node: { type: unknown; children: unknown[]; props: Record<string, unknown> }) => boolean): Array<{ props: Record<string, unknown> }>;
    };
  };
}
