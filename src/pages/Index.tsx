
import SalaryCalculator from "@/components/SalaryCalculator";
import TaxYearManager from "@/components/TaxYearManager";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 pt-4 flex justify-end">
        <TaxYearManager />
      </div>
      
      <SalaryCalculator />
      
      <footer className="mt-12 pb-8 text-center text-gray-500 text-sm">
        <p>© 2025 Australian Salary Calculator. For estimation purposes only.</p>
        <p className="mt-1">Not financial advice. Please consult with a tax professional.</p>
      </footer>
    </div>
  );
};

export default Index;
