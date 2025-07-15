export default function OrderConfirmation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Thank you for your order!</h1>
      <p className="text-gray-700 mb-8">Your order has been placed successfully. You will receive a confirmation email soon.</p>
      <a href="/shop" className="text-blue-600 underline">Continue Shopping</a>
    </div>
  );
}
