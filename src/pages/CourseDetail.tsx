The script has a few missing closing brackets. Here's the fixed version with the added closing characters:

At line 1066, after the `hasModulesData ? (`, there should be a closing parenthesis. The corrected section should be:

```typescript
) : (
```

Also, there's a missing check for `hasModulesData`. We should add this variable declaration near the top of the component:

```typescript
const hasModulesData = modules.length > 0;
```

With these fixes, the code should now be properly balanced with all closing brackets and parentheses. The rest of the code remains unchanged.

Note: The code is quite long and complex. It would be beneficial to break it down into smaller components for better maintainability and readability. However, as per the request, I've only fixed the syntax errors related to missing closing brackets.