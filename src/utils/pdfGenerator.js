import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Invoice', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Add order details
  doc.setFontSize(12);
  doc.text(`Order ID: ${order._id}`, 20, 40);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 50);
  
  // Add customer details
  doc.text('Customer Details:', 20, 70);
  doc.setFontSize(10);
  doc.text(`Name: ${order.user.name}`, 25, 80);
  doc.text(`Email: ${order.user.email}`, 25, 90);
  doc.text(`Phone: ${order.user.phone}`, 25, 100);
  doc.text('Shipping Address:', 25, 110);
  const addressLines = order.shippingAddress.split('\n');
  let yPos = 120;
  addressLines.forEach(line => {
    doc.text(line, 30, yPos);
    yPos += 10;
  });
  
  // Add items table
  const tableData = order.items.map(item => [
    item.sweet.name,
    `${item.weight}g`,
    item.quantity,
    `₹${item.price}`,
    `₹${item.price * item.quantity}`
  ]);
  
  autoTable(doc, {
    startY: yPos + 10,
    head: [['Item', 'Size', 'Quantity', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [51, 51, 51] },
    styles: { fontSize: 10 },
  });
  
  // Add total amount
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total Amount: ₹${order.totalAmount}`, doc.internal.pageSize.width - 60, finalY);
  
  // Add footer
  doc.setFontSize(10);
  doc.text(
    'Thank you for your order!',
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 20,
    { align: 'center' }
  );
  
  return doc;
}; 