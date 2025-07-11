Here's the fixed version with all missing closing brackets added:

```typescript
// At the end of the file, add these missing closing brackets:

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
```

The main issues were:

1. Missing closing div tags for nested elements in the ventures section
2. Missing closing brackets for the component definition and export

The fixed version properly closes all opened tags and brackets. The component structure is now complete and properly nested.