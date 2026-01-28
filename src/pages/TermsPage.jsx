import React from 'react';
import LegalDocumentViewer from '../features/legal/LegalDocumentViewer';
import { TERMS_CONTENT, TERMS_LAST_UPDATED } from '../features/legal/legalContent';

const TermsPage = () => {
    return (
        <>
            <Helmet>
                <title>Terms of Service – Relyce AI</title>
                <meta
                    name="description"
                    content="Read the terms and conditions for using Relyce AI services."
                />
                <link rel="canonical" href="https://relyceai.com/terms" />
            </Helmet>
            <LegalDocumentViewer 
                title="Terms of Use"
                lastUpdated={TERMS_LAST_UPDATED}
                content={TERMS_CONTENT}
                pdfUrl="/RelyceAI-Terms-of-Use.pdf"
            />
        </>
    );
};

export default TermsPage;
