Here's the fixed version with all missing closing brackets added:

```typescript
import React, { useState, useEffect } from 'react';
// ... [rest of imports]

const CourseDetail: React.FC = () => {
  // ... [rest of component code]

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ... [rest of JSX] */}
      </div>

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
    </>
  );
};

export default CourseDetail;
```

I added the missing closing brackets at the end of the file. The component was missing its final closing brackets for the return statement and the component definition.
