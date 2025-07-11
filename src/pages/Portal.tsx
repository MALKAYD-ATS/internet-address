Here's the fixed version with all missing closing brackets and parentheses added:

[Previous content remains the same until the end, where these closing brackets were missing]

```typescript
                    </Swiper>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portal;
```

The main issues were:

1. Missing closing tag for `</Swiper>`
2. Missing closing curly brace for the conditional rendering block
3. Missing closing tags for multiple nested `div` elements
4. Missing closing parenthesis and curly brace for the component definition
5. Missing export statement

The structure is now properly nested and all brackets are matched.