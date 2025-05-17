
import React, { useState } from 'react';
import { 
  calculateTakeHomeSalary, 
  calculateContractRate, 
  taxYears,
  SalaryCalculationResult,
  ContractCalculationResult
} from "@/utils/taxCalculator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalaryScenario {
  baseSalary: number;
  permanentResults?: SalaryCalculationResult;
  contractResults?: ContractCalculationResult;
}

const SalaryComparisonTable = () => {
  const [yearKey, setYearKey] = useState<string>("2024-25");
  const [includingSuper, setIncludingSuper] = useState<boolean>(false);
  const [superRate, setSuperRate] = useState<string>(String(taxYears[yearKey]?.superRate * 100 || "11.5"));
  const [scenarios, setScenarios] = useState<SalaryScenario[]>([
    { baseSalary: 80000 },
    { baseSalary: 90000 },
    { baseSalary: 100000 },
    { baseSalary: 110000 },
    { baseSalary: 120000 }
  ]);
  const [newSalary, setNewSalary] = useState<string>("");
  const [upliftPercentage, setUpliftPercentage] = useState<number>(20);

  // Calculate results for all scenarios
  const calculatedScenarios = scenarios.map(scenario => {
    try {
      const permanentResults = calculateTakeHomeSalary(
        scenario.baseSalary,
        yearKey,
        includingSuper,
        parseFloat(superRate)
      );
      
      const contractResults = calculateContractRate(
        scenario.baseSalary,
        upliftPercentage
      );
      
      return {
        ...scenario,
        permanentResults,
        contractResults
      };
    } catch (error) {
      console.error("Calculation error for salary:", scenario.baseSalary, error);
      return scenario;
    }
  });

  // Handle adding a new salary to compare
  const handleAddSalary = () => {
    const salaryValue = parseFloat(newSalary);
    if (!isNaN(salaryValue) && salaryValue > 0) {
      setScenarios([...scenarios, { baseSalary: salaryValue }]);
      setNewSalary("");
    }
  };

  // Handle removing a salary from the comparison
  const handleRemoveSalary = (index: number) => {
    const newScenarios = [...scenarios];
    newScenarios.splice(index, 1);
    setScenarios(newScenarios);
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full max-w-md mx-auto block mb-8">
          Compare Salary Scenarios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Salary Comparison Table</DialogTitle>
          <DialogDescription>
            Compare take-home pay for different salary scenarios to help with negotiations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="comparison-year">Financial Year</Label>
              <Select value={yearKey} onValueChange={setYearKey}>
                <SelectTrigger id="comparison-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(taxYears).map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <Switch 
                id="including-super-comparison" 
                checked={includingSuper}
                onCheckedChange={setIncludingSuper}
              />
              <Label htmlFor="including-super-comparison">Salary includes super</Label>
            </div>
            
            <div>
              <Label htmlFor="super-rate-comparison">Superannuation Rate (%)</Label>
              <div className="flex">
                <Input
                  id="super-rate-comparison"
                  type="text"
                  inputMode="numeric"
                  value={superRate}
                  onChange={(e) => setSuperRate(e.target.value)}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-700">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Add new salary scenario */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="new-salary">Add Salary to Compare</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                  $
                </span>
                <Input
                  id="new-salary"
                  type="text"
                  inputMode="numeric"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="e.g. 95000"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <Button className="mt-6" onClick={handleAddSalary}>Add</Button>
          </div>

          {/* Comparison Table */}
          <Tabs defaultValue="permanent" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="permanent">Permanent Role</TabsTrigger>
              <TabsTrigger value="contractor">Contractor Role</TabsTrigger>
            </TabsList>
            
            <TabsContent value="permanent">
              <Card>
                <CardHeader>
                  <CardTitle>Permanent Role Comparison</CardTitle>
                  <CardDescription>
                    Compare take-home salary across different base salaries for {yearKey}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Gross Salary</TableHead>
                          <TableHead>Tax</TableHead>
                          <TableHead>Medicare</TableHead>
                          <TableHead>Super</TableHead>
                          <TableHead>Net Annual</TableHead>
                          <TableHead>Monthly</TableHead>
                          <TableHead>Fortnightly</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculatedScenarios.map((scenario, index) => (
                          <TableRow key={`${scenario.baseSalary}-${index}`}>
                            <TableCell className="font-medium">{formatCurrency(scenario.baseSalary)}</TableCell>
                            <TableCell>{scenario.permanentResults ? formatCurrency(scenario.permanentResults.tax) : '-'}</TableCell>
                            <TableCell>{scenario.permanentResults ? formatCurrency(scenario.permanentResults.medicareLevy) : '-'}</TableCell>
                            <TableCell>{scenario.permanentResults ? formatCurrency(scenario.permanentResults.superannuation) : '-'}</TableCell>
                            <TableCell className="font-bold">{scenario.permanentResults ? formatCurrency(scenario.permanentResults.netAnnual) : '-'}</TableCell>
                            <TableCell className="font-semibold">{scenario.permanentResults ? formatCurrency(scenario.permanentResults.netMonthly) : '-'}</TableCell>
                            <TableCell>{scenario.permanentResults ? formatCurrency(scenario.permanentResults.netFortnightly) : '-'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveSalary(index)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contractor">
              <Card>
                <CardHeader>
                  <CardTitle>Contractor Rate Comparison</CardTitle>
                  <CardDescription>
                    Compare contractor rates with {upliftPercentage}% uplift across different base salaries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Base Salary</TableHead>
                          <TableHead>Contract Annual</TableHead>
                          <TableHead>Monthly</TableHead>
                          <TableHead>Daily</TableHead>
                          <TableHead>Uplift Rate</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculatedScenarios.map((scenario, index) => (
                          <TableRow key={`${scenario.baseSalary}-${index}`}>
                            <TableCell className="font-medium">{formatCurrency(scenario.baseSalary)}</TableCell>
                            <TableCell className="font-bold">
                              {scenario.contractResults ? formatCurrency(scenario.contractResults.contractAnnual.selected) : '-'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {scenario.contractResults ? formatCurrency(scenario.contractResults.contractMonthly) : '-'}
                            </TableCell>
                            <TableCell>
                              {scenario.contractResults ? formatCurrency(scenario.contractResults.contractDaily) : '-'}
                            </TableCell>
                            <TableCell>{scenario.contractResults ? `${scenario.contractResults.upliftPercentage}%` : '-'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveSalary(index)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryComparisonTable;
