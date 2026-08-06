
### Component Deletion Rule
Before deleting anything:
1. Verify it has zero imports.
2. Verify it has zero dynamic imports.
3. Verify it has zero lazy imports.
4. Verify it is not referenced by routing.
5. Verify it is not referenced by Storybook/tests/docs.
6. Verify it is not part of the design system.
Only then delete it.
