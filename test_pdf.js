const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

async function test() {
    try {
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'portrait',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        doc.pipe(fs.createWriteStream('test.pdf'));

        const primaryColor = '#1e293b';
        const secondaryColor = '#64748b';
        const accentColor = '#D95F3B'; 

        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
           .lineWidth(2)
           .strokeColor(accentColor)
           .stroke();
           
        doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
           .lineWidth(1)
           .strokeColor('#e2e8f0')
           .stroke();

        const companyName = "Test Company";
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text(companyName, { align: 'center' });
           
        doc.moveDown(1);
           
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text('CERTIFICATE OF INTERNSHIP COMPLETION', { align: 'center', characterSpacing: 2 });
           
        doc.moveDown(2);

        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor(primaryColor)
           .text('TO WHOMSOEVER IT MAY CONCERN', { align: 'center' });
           
        doc.moveDown(2);

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor(primaryColor)
           .lineGap(6);

        const studentName = "TEST STUDENT";
        const usn = 'TEST_USN';
        const college = 'Test College';
        const intTitle = 'SOFTWARE ENGINEER INTERN';
        
        const start = 'start';
        const end = 'end';
        
        const durationText = `${start} to ${end}`;
        
        const p1 = `This is to certify that ${studentName}, bearing Reg No: ${usn} from ${college}, has successfully completed an Industry Internship in ${intTitle} from ${durationText}, conducted by ${companyName.toUpperCase()}.`;
        
        doc.text(p1, { align: 'justify' });
        doc.moveDown(1);

        const skillsStr = 'JS, Node';

        const p2 = `During this period, the intern gained practical exposure to ${skillsStr}, enhancing both development and professional skills.`;
        doc.text(p2, { align: 'justify' });
        doc.moveDown(1);

        const p3 = `As part of the internship, the intern worked on the following project: test details`;
        doc.text(p3, { align: 'justify' });
        doc.moveDown(1);

        const p4 = `Throughout the internship, ${studentName} displayed strong technical skills, problem-solving ability, and eagerness to apply concepts in practice. This certificate, issued with Certificate ID: 1234, can be verified through the official verification system.`;
        doc.text(p4, { align: 'justify' });
        
        doc.moveDown(4);

        const qrData = `Verify Certificate: 1234\nName: ${studentName}\nInternship: ${intTitle}\nCompany: ${companyName}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        
        const bottomY = doc.page.height - 180;
        
        doc.image(qrBuffer, doc.page.width - 150, bottomY, { fit: [80, 80] });
        
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`CERTIFICATE ID\n1234`, doc.page.width - 175, bottomY + 85, { align: 'center', width: 130 });

        doc.moveTo(70, bottomY + 70)
           .lineTo(220, bottomY + 70)
           .strokeColor(primaryColor)
           .lineWidth(1)
           .stroke();
           
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('AUTHORIZED SIGNATORY', 70, bottomY + 80, { width: 150, align: 'center' });
        doc.font('Helvetica')
           .fillColor(secondaryColor)
           .text(companyName.toUpperCase(), 70, bottomY + 95, { width: 150, align: 'center' });
           
        doc.fontSize(8)
           .fillColor(secondaryColor)
           .text('This is a digitally generated certificate.', 50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });

        doc.end();
        console.log("PDF generated successfully");
    } catch(err) {
        console.log("Error:", err);
    }
}
test();
