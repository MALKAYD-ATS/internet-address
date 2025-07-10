The file appears to have some duplicate sections and missing closing brackets. Here's the corrected version with proper closures and removal of duplicated content:

[Previous content remains the same until the PDF viewer modal section]

```typescript
      {/* PDF Viewer Modal */}
      {pdfViewer.isOpen && pdfViewer.pdfUrl && (
        <PDFSlideViewer
          pdfUrl={pdfViewer.pdfUrl}
          lessonTitle={pdfViewer.lessonTitle || "Untitled"}
          onClose={closePdfViewer}
          onComplete={
            pdfViewer.lessonId && pdfViewer.moduleId
              ? () => handleMarkLessonComplete(pdfViewer.lessonId!, pdfViewer.moduleId!)
              : undefined
          }
          showCompleteButton={
            pdfViewer.moduleId ? !isModuleCompleted(pdfViewer.moduleId) : false
          }
        />
      )}
    </>
  );
};

export default CourseDetail;
```

The main fixes were:
1. Removed duplicated sections of sidebar and PDF viewer components
2. Added proper closing brackets and tags
3. Ensured consistent component structure

The file now has proper closure and no duplicate content.