
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addTaxYear, updateTaxYear, TaxYear, taxYears } from "@/utils/taxCalculator";
import { toast } from "sonner";

interface BracketInput {
  min: string;
  max: string;
  baseAmount: string;
  rate: string;
}

const TaxYearManager = () => {
  // State for adding a new tax year
  const [newYearKey, setNewYearKey] = useState<string>("");
  const [newBrackets, setNewBrackets] = useState<BracketInput[]>([
    { min: "0", max: "18200", baseAmount: "0", rate: "0" },
    { min: "18201", max: "45000", baseAmount: "0", rate: "0.16" },
    { min: "", max: "", baseAmount: "", rate: "" },
  ]);
  const [newMedicareLevy, setNewMedicareLevy] = useState<string>("0.02");
  const [newSuperRate, setNewSuperRate] = useState<string>("0.12");
  
  // State for updating an existing tax year
  const [selectedYearToUpdate, setSelectedYearToUpdate] = useState<string>(Object.keys(taxYears)[0]);
  const [updatedBrackets, setUpdatedBrackets] = useState<BracketInput[]>([]);
  const [updatedMedicareLevy, setUpdatedMedicareLevy] = useState<string>("");
  const [updatedSuperRate, setUpdatedSuperRate] = useState<string>("");
  
  // Load selected year data when changing the year to update
  React.useEffect(() => {
    if (selectedYearToUpdate) {
      const yearData = taxYears[selectedYearToUpdate];
      if (yearData) {
        const bracketInputs = yearData.brackets.map(bracket => ({
          min: String(bracket.min),
          max: bracket.max === null ? "" : String(bracket.max),
          baseAmount: String(bracket.baseAmount),
          rate: String(bracket.rate)
        }));
        setUpdatedBrackets(bracketInputs);
        setUpdatedMedicareLevy(String(yearData.medicareLevy));
        setUpdatedSuperRate(String(yearData.superRate));
      }
    }
  }, [selectedYearToUpdate]);
  
  // Add a new bracket input field
  const addNewBracket = (isNew: boolean) => {
    if (isNew) {
      setNewBrackets([...newBrackets, { min: "", max: "", baseAmount: "", rate: "" }]);
    } else {
      setUpdatedBrackets([...updatedBrackets, { min: "", max: "", baseAmount: "", rate: "" }]);
    }
  };
  
  // Handle changes to bracket inputs
  const handleBracketChange = (index: number, field: keyof BracketInput, value: string, isNew: boolean) => {
    if (isNew) {
      const updatedBrackets = [...newBrackets];
      updatedBrackets[index] = { ...updatedBrackets[index], [field]: value };
      setNewBrackets(updatedBrackets);
    } else {
      const updatedBracketsArray = [...updatedBrackets];
      updatedBracketsArray[index] = { ...updatedBracketsArray[index], [field]: value };
      setUpdatedBrackets(updatedBracketsArray);
    }
  };
  
  // Handle form submission to add a new tax year
  const handleAddTaxYear = () => {
    try {
      // Validate year format (e.g., 2025-26)
      if (!/^\d{4}-\d{2}$/.test(newYearKey)) {
        toast.error("Year format should be YYYY-YY (e.g., 2025-26)");
        return;
      }
      
      // Process and validate bracket data
      const processedBrackets = newBrackets
        .filter(b => b.min !== "" && b.rate !== "")
        .map(b => ({
          min: Number(b.min),
          max: b.max === "" ? null : Number(b.max),
          baseAmount: Number(b.baseAmount),
          rate: Number(b.rate)
        }));
      
      if (processedBrackets.length === 0) {
        toast.error("At least one tax bracket is required");
        return;
      }
      
      // Create new tax year object
      const newTaxYear: TaxYear = {
        year: newYearKey,
        brackets: processedBrackets,
        medicareLevy: Number(newMedicareLevy),
        superRate: Number(newSuperRate)
      };
      
      // Add the new tax year
      addTaxYear(newYearKey, newTaxYear);
      
      // Reset form and show success message
      toast.success(`Tax year ${newYearKey} added successfully`);
      setNewYearKey("");
      setNewBrackets([
        { min: "0", max: "18200", baseAmount: "0", rate: "0" },
        { min: "18201", max: "45000", baseAmount: "0", rate: "0.16" },
      ]);
      setNewMedicareLevy("0.02");
      setNewSuperRate("0.12");
      
      // Update the selected year dropdown to include the new year
      setSelectedYearToUpdate(newYearKey);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle form submission to update an existing tax year
  const handleUpdateTaxYear = () => {
    try {
      // Process and validate bracket data
      const processedBrackets = updatedBrackets
        .filter(b => b.min !== "" && b.rate !== "")
        .map(b => ({
          min: Number(b.min),
          max: b.max === "" ? null : Number(b.max),
          baseAmount: Number(b.baseAmount),
          rate: Number(b.rate)
        }));
      
      if (processedBrackets.length === 0) {
        toast.error("At least one tax bracket is required");
        return;
      }
      
      // Create updates object
      const updates: Partial<TaxYear> = {
        brackets: processedBrackets
      };
      
      if (updatedMedicareLevy) {
        updates.medicareLevy = Number(updatedMedicareLevy);
      }
      
      if (updatedSuperRate) {
        updates.superRate = Number(updatedSuperRate);
      }
      
      // Update the tax year
      updateTaxYear(selectedYearToUpdate, updates);
      
      // Show success message
      toast.success(`Tax year ${selectedYearToUpdate} updated successfully`);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Tax Years</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tax Year Manager</DialogTitle>
          <DialogDescription>
            Add new tax years or update existing tax brackets and rates.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="add">Add New Tax Year</TabsTrigger>
            <TabsTrigger value="update">Update Existing Tax Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="new-year-key">Financial Year</Label>
                <Input
                  id="new-year-key"
                  placeholder="e.g., 2025-26"
                  value={newYearKey}
                  onChange={(e) => setNewYearKey(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">Format: YYYY-YY (e.g., 2025-26)</p>
              </div>
              
              <div>
                <Label>Tax Brackets</Label>
                <div className="space-y-3 mt-2">
                  {newBrackets.map((bracket, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <div>
                        <Label htmlFor={`new-min-${index}`} className="text-xs">Min</Label>
                        <Input
                          id={`new-min-${index}`}
                          placeholder="Min"
                          value={bracket.min}
                          onChange={(e) => handleBracketChange(index, 'min', e.target.value, true)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`new-max-${index}`} className="text-xs">Max (blank for no limit)</Label>
                        <Input
                          id={`new-max-${index}`}
                          placeholder="Max"
                          value={bracket.max}
                          onChange={(e) => handleBracketChange(index, 'max', e.target.value, true)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`new-base-${index}`} className="text-xs">Base Amount</Label>
                        <Input
                          id={`new-base-${index}`}
                          placeholder="Base Amount"
                          value={bracket.baseAmount}
                          onChange={(e) => handleBracketChange(index, 'baseAmount', e.target.value, true)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`new-rate-${index}`} className="text-xs">Rate (decimal)</Label>
                        <Input
                          id={`new-rate-${index}`}
                          placeholder="e.g., 0.19"
                          value={bracket.rate}
                          onChange={(e) => handleBracketChange(index, 'rate', e.target.value, true)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addNewBracket(true)}>
                    Add Bracket
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-medicare-levy">Medicare Levy (decimal)</Label>
                  <Input
                    id="new-medicare-levy"
                    placeholder="e.g., 0.02"
                    value={newMedicareLevy}
                    onChange={(e) => setNewMedicareLevy(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-super-rate">Superannuation Rate (decimal)</Label>
                  <Input
                    id="new-super-rate"
                    placeholder="e.g., 0.12"
                    value={newSuperRate}
                    onChange={(e) => setNewSuperRate(e.target.value)}
                  />
                </div>
              </div>
              
              <Button className="mt-4" onClick={handleAddTaxYear}>
                Add Tax Year
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="update" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="select-year">Select Tax Year to Update</Label>
                <select
                  id="select-year"
                  className="w-full border rounded p-2"
                  value={selectedYearToUpdate}
                  onChange={(e) => setSelectedYearToUpdate(e.target.value)}
                >
                  {Object.keys(taxYears).map((yearKey) => (
                    <option key={yearKey} value={yearKey}>
                      {yearKey}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Tax Brackets</Label>
                <div className="space-y-3 mt-2">
                  {updatedBrackets.map((bracket, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2">
                      <div>
                        <Label htmlFor={`upd-min-${index}`} className="text-xs">Min</Label>
                        <Input
                          id={`upd-min-${index}`}
                          placeholder="Min"
                          value={bracket.min}
                          onChange={(e) => handleBracketChange(index, 'min', e.target.value, false)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`upd-max-${index}`} className="text-xs">Max (blank for no limit)</Label>
                        <Input
                          id={`upd-max-${index}`}
                          placeholder="Max"
                          value={bracket.max}
                          onChange={(e) => handleBracketChange(index, 'max', e.target.value, false)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`upd-base-${index}`} className="text-xs">Base Amount</Label>
                        <Input
                          id={`upd-base-${index}`}
                          placeholder="Base Amount"
                          value={bracket.baseAmount}
                          onChange={(e) => handleBracketChange(index, 'baseAmount', e.target.value, false)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`upd-rate-${index}`} className="text-xs">Rate (decimal)</Label>
                        <Input
                          id={`upd-rate-${index}`}
                          placeholder="e.g., 0.19"
                          value={bracket.rate}
                          onChange={(e) => handleBracketChange(index, 'rate', e.target.value, false)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addNewBracket(false)}>
                    Add Bracket
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="upd-medicare-levy">Medicare Levy (decimal)</Label>
                  <Input
                    id="upd-medicare-levy"
                    placeholder="e.g., 0.02"
                    value={updatedMedicareLevy}
                    onChange={(e) => setUpdatedMedicareLevy(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="upd-super-rate">Superannuation Rate (decimal)</Label>
                  <Input
                    id="upd-super-rate"
                    placeholder="e.g., 0.12"
                    value={updatedSuperRate}
                    onChange={(e) => setUpdatedSuperRate(e.target.value)}
                  />
                </div>
              </div>
              
              <Button className="mt-4" onClick={handleUpdateTaxYear}>
                Update Tax Year
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-end">
          <DialogTrigger asChild>
            <Button variant="outline">Close</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaxYearManager;
