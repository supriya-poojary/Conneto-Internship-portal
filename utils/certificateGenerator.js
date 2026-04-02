const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates a premium internship certificate PDF.
 * @param {Object} data - { studentName, internshipTitle, companyName, date, certificateId }
 * @param {Object} res - Express response object to stream the PDF to.
 */
function generateCertificate(data, res) {
    const { studentName, internshipTitle, companyName, date, certificateId } = data;
    
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0
    });

    // Set response headers for download
    const filename = `Certificate_${studentName.replace(/\s+/g, '_')}_${certificateId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // ─── BACKGROUND & BORDER ──────────────────────────────────────────────
    // Background color (cream/off-white)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFAF5');

    // Outer Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(2)
       .stroke('#D95F3B'); // Coral color from the app theme

    // Inner Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(1)
       .stroke('#B5384A'); // Rose color

    // Corner Ornaments (Custom shapes)
    const drawCorner = (x, y, rotation) => {
        doc.save();
        doc.translate(x, y);
        doc.rotate(rotation);
        doc.rect(-15, -15, 30, 30).fill('#D95F3B');
        doc.restore();
    };

    drawCorner(30, 30, 0);
    drawCorner(doc.page.width - 30, 30, 90);
    drawCorner(doc.page.width - 30, doc.page.height - 30, 180);
    drawCorner(30, doc.page.height - 30, 270);

    // ─── CONTENT ──────────────────────────────────────────────────────────
    
    // Header
    doc.fillColor('#1A1A1A')
       .font('Helvetica-Bold')
       .fontSize(42)
       .text('CERTIFICATE', 0, 80, { align: 'center', characterSpacing: 5 });
       
    doc.fontSize(16)
       .font('Helvetica')
       .text('OF COMPLETION', 0, 130, { align: 'center', characterSpacing: 2 });

    // Decorative line
    const centerX = doc.page.width / 2;
    doc.moveTo(centerX - 100, 155).lineTo(centerX + 100, 155).lineWidth(1).stroke('#D95F3B');

    // Main Text
    doc.fontSize(18)
       .fillColor('#4B5563')
       .text('This is to certify that', 0, 190, { align: 'center' });

    // Student Name
    doc.fontSize(38)
       .fillColor('#1A1A1A')
       .font('Helvetica-Bold')
       .text(studentName.toUpperCase(), 0, 220, { align: 'center' });

    // Completion text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#4B5563')
       .text('has successfully completed an internship in the field of', 0, 275, { align: 'center' });

    // Internship Title
    doc.fontSize(24)
       .fillColor('#D95F3B')
       .font('Helvetica-Bold')
       .text(internshipTitle, 0, 310, { align: 'center' });

    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#4B5563')
       .text(`at ${companyName}`, 0, 350, { align: 'center' });

    // Date
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    doc.fontSize(14)
       .text(`Issued on ${formattedDate}`, 0, 390, { align: 'center' });

    // ─── FOOTER ───────────────────────────────────────────────────────────

    // Signature Area
    const footerY = 460;
    
    // Left: Company Representative
    doc.moveTo(100, footerY + 30).lineTo(300, footerY + 30).lineWidth(1).stroke('#9CA3AF');
    doc.fontSize(12).fillColor('#1A1A1A').font('Helvetica-Bold').text('COMPANY AUTHORIZED SIGNATORY', 100, footerY + 40, { width: 200, align: 'center' });
    doc.fontSize(10).font('Helvetica').text(companyName, 100, footerY + 55, { width: 200, align: 'center' });

    // Right: Platform Verification
    doc.moveTo(doc.page.width - 300, footerY + 30).lineTo(doc.page.width - 100, footerY + 30).lineWidth(1).stroke('#9CA3AF');
    doc.fontSize(12).fillColor('#1A1A1A').font('Helvetica-Bold').text('CONNETO VERIFICATION', doc.page.width - 300, footerY + 40, { width: 200, align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Career & Academic Portal', doc.page.width - 300, footerY + 55, { width: 200, align: 'center' });

    // Certificate ID & Logo at bottom
    doc.fontSize(9)
       .fillColor('#9CA3AF')
       .text(`VERIFICATION ID: ${certificateId}`, 0, doc.page.height - 60, { align: 'center' });

    doc.fontSize(14)
       .fillColor('#D95F3B')
       .font('Helvetica-Bold')
       .text('CONNETO', 0, doc.page.height - 45, { align: 'center' });

    // Add a seal
    doc.save();
    doc.translate(centerX, 450);
    doc.circle(0, 0, 35).lineWidth(2).stroke('#D95F3B');
    doc.circle(0, 0, 30).lineWidth(0.5).stroke('#D95F3B');
    doc.fontSize(10).fillColor('#D95F3B').font('Helvetica-Bold').text('OFFICIAL', -25, -12, { width: 50, align: 'center' });
    doc.text('SEAL', -25, 2, { width: 50, align: 'center' });
    doc.restore();

    doc.end();
}

module.exports = { generateCertificate };
