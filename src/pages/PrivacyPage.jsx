import React from 'react';
import LegalDocumentViewer from '../features/legal/LegalDocumentViewer';
import { PRIVACY_CONTENT, PRIVACY_LAST_UPDATED } from '../features/legal/legalContent';

const PrivacyPage = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy – Relyce AI</title>
                <meta
                    name="description"
                    content="Learn how Relyce AI protects your data. We do not train on your conversations. Ever."
                />
                <link rel="canonical" href="https://relyceai.com/privacy" />
            </Helmet>
            <LegalDocumentViewer 
                title="Privacy Policy"
                lastUpdated={PRIVACY_LAST_UPDATED}
                content={PRIVACY_CONTENT}
                pdfUrl="/RelyceAI-Privacy-Policy.pdf"
            />
        </>
    );
};

export default PrivacyPage;
