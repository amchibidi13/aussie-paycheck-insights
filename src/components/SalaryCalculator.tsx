
import React, { useState, ChangeEvent } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { 
  calculateTakeHomeSalary, 
  calculateContractRate,
  taxYears 
} from "@/utils/taxCalculator";
import { InfoIcon } from 'lucide-react';

const SalaryCalculator = () => {
  // Take-home salary calculator state
  const [yearKey, setYearKey] = useState<string>("2024-25");
  const [grossSalary, setGrossSalary] = useState<string>("");
  const [superRate, setSuperRate] = useState<string>(String(taxYears[yearKey]?.superRate * 100 || "11"));
  const [includingSuper, setIncludingSuper] = useState<boolean>(false);
  
  // Contractor rate calculator state
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [upliftPercentage, setUpliftPercentage] = useState<number>(20);

  // Calculate take-home results
  const takeHomeResults = React.useMemo(() => {
    const grossSalaryNum = parseFloat(grossSalary);
    if (isNaN(grossSalaryNum) || grossSalaryNum <= 0) return null;

    try {
      return calculateTakeHomeSalary(
        grossSalaryNum,
        yearKey,
        includingSuper,
        parseFloat(superRate)
      );
    } catch (error) {
      console.error("Calculation error:", error);
      return null;
    }
  }, [grossSalary, yearKey, includingSuper, superRate]);

  // Calculate contractor results
  const contractResults = React.useMemo(() => {
    const baseSalaryNum = parseFloat(baseSalary);
    if (isNaN(baseSalaryNum) || baseSalaryNum <= 0) return null;

    try {
      return calculateContractRate(baseSalaryNum, upliftPercentage);
    } catch (error) {
      console.error("Calculation error:", error);
      return null;
    }
  }, [baseSalary, upliftPercentage]);

  // Handle input changes
  const handleGrossSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setGrossSalary(value);
    }
  };

  const handleSuperRateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setSuperRate(value);
    }
  };

  const handleBaseSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setBaseSalary(value);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Australian Salary Calculator</h1>
          <p className="text-gray-600">Calculate your take-home pay and contractor rates</p>
        </div>

        <Tabs defaultValue="take-home" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="take-home">Take-Home Salary</TabsTrigger>
            <TabsTrigger value="contractor">Contractor Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="take-home">
            <Card>
              <CardHeader>
                <CardTitle>Take-Home Salary Calculator</CardTitle>
                <CardDescription>Calculate your net income after tax and Medicare levy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assessment-year">Assessment Year</Label>
                      <Select 
                        value={yearKey} 
                        onValueChange={(value) => setYearKey(value)}
                      >
                        <SelectTrigger id="assessment-year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(taxYears).map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="gross-salary">Annual Gross Salary (AUD)</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                          $
                        </span>
                        <Input
                          id="gross-salary"
                          type="text"
                          inputMode="numeric"
                          value={grossSalary}
                          onChange={handleGrossSalaryChange}
                          placeholder="e.g. 85000"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="including-super"
                        checked={includingSuper}
                        onCheckedChange={setIncludingSuper}
                      />
                      <Label htmlFor="including-super">Salary is inclusive of superannuation</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Toggle if your salary amount includes your employer's super contribution</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="super-rate">Superannuation Rate (%)</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Default is {taxYears[yearKey]?.superRate * 100}% for {yearKey}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex">
                        <Input
                          id="super-rate"
                          type="text"
                          inputMode="numeric"
                          value={superRate}
                          onChange={handleSuperRateChange}
                          placeholder={String(taxYears[yearKey]?.superRate * 100 || 11)}
                          className="rounded-r-none"
                        />
                        <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-700">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Section */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Your Results</h3>
                    
                    {takeHomeResults ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-600">Gross Salary:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.grossAnnual)}</div>
                          
                          <div className="text-sm text-gray-600">Income Tax:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.tax)}</div>
                          
                          <div className="text-sm text-gray-600">Medicare Levy:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.medicareLevy)}</div>
                          
                          <div className="text-sm text-gray-600">Superannuation:</div>
                          <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.superannuation)}</div>
                          
                          <div className="border-t border-gray-200 col-span-2 my-2"></div>
                        </div>
                        
                        <div className="bg-calculator-blue bg-opacity-10 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-semibold text-calculator-blue">Annual Take-Home:</div>
                            <div className="font-bold text-calculator-blue text-right">{formatCurrency(takeHomeResults.netAnnual)}</div>
                            
                            <div className="text-sm text-calculator-blue-dark">Monthly:</div>
                            <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.netMonthly)}</div>
                            
                            <div className="text-sm text-calculator-blue-dark">Fortnightly:</div>
                            <div className="text-sm font-medium text-right">{formatCurrency(takeHomeResults.netFortnightly)}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Enter your salary details to see results</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                <p>Tax calculations are estimates based on current ATO rates for {yearKey}.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="contractor">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Rate Estimator</CardTitle>
                <CardDescription>Convert your permanent salary to an equivalent contractor rate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="base-salary">Annual Base Salary (AUD)</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                          $
                        </span>
                        <Input
                          id="base-salary"
                          type="text"
                          inputMode="numeric"
                          value={baseSalary}
                          onChange={handleBaseSalaryChange}
                          placeholder="e.g. 85000"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Contract Uplift: {upliftPercentage}%</Label>
                        <span className="text-xs text-gray-500">
                          (Range: 15% - 30%)
                        </span>
                      </div>
                      <Slider
                        value={[upliftPercentage]}
                        min={15}
                        max={30}
                        step={1}
                        onValueChange={(values) => setUpliftPercentage(values[0])}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>15%</span>
                        <span>30%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">
                        The typical uplift for contractors ranges from 15% to 30% to account for:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                        <li>No paid leave or sick days</li>
                        <li>No employer superannuation</li>
                        <li>Variable work availability</li>
                        <li>Business expenses and insurance</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Results Section */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">Contractor Rate Results</h3>
                    
                    {contractResults ? (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-gray-600">Base Salary:</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(contractResults.baseAnnualSalary)}
                          </div>
                          
                          <div className="text-sm text-gray-600">Uplift Applied:</div>
                          <div className="text-sm font-medium text-right">{contractResults.upliftPercentage}%</div>
                          
                          <div className="border-t border-gray-200 col-span-2 my-2"></div>
                          
                          <div className="text-sm text-gray-600">Contract Rate Range:</div>
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(contractResults.contractAnnual.min)} - {formatCurrency(contractResults.contractAnnual.max)}
                          </div>
                        </div>
                        
                        <div className="bg-calculator-blue bg-opacity-10 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-semibold text-calculator-blue">Annual Contract Rate:</div>
                            <div className="font-bold text-calculator-blue text-right">
                              {formatCurrency(contractResults.contractAnnual.selected)}
                            </div>
                            
                            <div className="text-sm text-calculator-blue-dark">Monthly Rate:</div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(contractResults.contractMonthly)}
                            </div>
                            
                            <div className="text-sm text-calculator-blue-dark">Daily Rate:</div>
                            <div className="text-sm font-medium text-right">
                              {formatCurrency(contractResults.contractDaily)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Enter your salary details to see results</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                <p>Daily rate is calculated based on 230 working days per year.</p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaryCalculator;
