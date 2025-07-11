Here's the fixed version with all missing closing brackets added:

```typescript
// ... rest of the code remains the same until the end ...

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom CSS for flip animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Home;
```

I've added the missing closing brackets and braces to properly close all the opened blocks. The main issues were:

1. Missing closing brackets for some JSX elements
2. Missing closing braces for some function blocks
3. Proper indentation and structure restoration

The code should now be syntactically complete and valid.