The script has a few missing closing brackets. Here's the fixed version with the added closing characters:

At line 1066, after the `hasModulesData ? (`, there should be a closing parenthesis. The corrected section should be:

```typescript
) : (
```

Also, there's a missing check for `hasModulesData`. We need to add this variable declaration. After the `loadingModules ? (` block, it should be:

```typescript
const hasModulesData = modules.length > 0;
```

With these fixes, the code should now be properly balanced with all closing brackets and parentheses. The rest of the code remains unchanged.

The main issues were:
1. Missing closing parenthesis for a ternary operator
2. Missing variable declaration for `hasModulesData`

These changes will resolve the syntax errors in the code while maintaining all the existing functionality.