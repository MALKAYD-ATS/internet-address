Here's the fixed version with all closing brackets properly added:

```typescript
const CourseDetail: React.FC = () => {
  // ... [previous code remains the same until the return statement]

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ... [all the JSX content remains the same] */}
        {pdfViewer.isOpen && pdfViewer.pdfUrl && (
          <PDFSlideViewer
            pdfUrl={pdfViewer.pdfUrl}
            lessonTitle={pdfViewer.lessonTitle || "Untitled"}
            onClose={closePdfViewer}
            onComplete={
              pdfViewer.lessonId && pdfViewer.moduleId
                ? () => handleMarkLessonComplete(pdfViewer.lessonId, pdfViewer.moduleId)
                : undefined
            }
            showCompleteButton={
              pdfViewer.moduleId ? !isModuleCompleted(pdfViewer.moduleId) : false
            }
          />
        )}
      </div>
    </>
  );
};

export default CourseDetail;
```

I've added:
1. The closing bracket for the component function
2. The export statement
3. Properly nested the closing tags for the main div and fragment
4. Ensured all JSX elements are properly closed

The component should now be syntactically complete and valid.
