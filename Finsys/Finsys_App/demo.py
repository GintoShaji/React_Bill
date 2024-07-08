
@api_view(("GET",))
def Fin_fetchPurchaseBillData(request, id):
    try:
        data = Fin_Login_Details.objects.get(id=id)
        if data.User_Type == "Company":
            cmp = Fin_Company_Details.objects.get(Login_Id=id)
        else:
            cmp = Fin_Staff_Details.objects.get(Login_Id=id).company_id

        items = Fin_Items.objects.filter(Company = cmp, status = 'Active')
        cust = Fin_Customers.objects.filter(Company=cmp)
        ven = Fin_Vendor.objects.filter(Company=cmp)
        trms = Fin_Company_Payment_Terms.objects.filter(Company = cmp)
        bnk = Fin_Banking.objects.filter(company = cmp)
        lst = Fin_Price_List.objects.filter(Company = cmp, status = 'Active')
        units = Fin_Units.objects.filter(Company = cmp)
        acc = Fin_Chart_Of_Account.objects.filter(Q(account_type='Expense') | Q(account_type='Other Expense') | Q(account_type='Cost Of Goods Sold'), Company=cmp).order_by('account_name')
        custLists = Fin_Price_List.objects.filter(Company = cmp, type__iexact='sales', status = 'Active')
        
        itemSerializer = ItemSerializer(items, many=True)
        custSerializer = CustomerSerializer(cust, many=True)
        venSerializer = VendorSerializer(ven, many=True)
        pTermSerializer = CompanyPaymentTermsSerializer(trms, many=True)
        bankSerializer = BankSerializer(bnk, many=True)
        lstSerializer = PriceListSerializer(lst, many=True)
        clSerializer = PriceListSerializer(custLists, many=True)
        unitSerializer = ItemUnitSerializer(units, many=True)
        accSerializer = AccountsSerializer(acc, many=True)

        # Fetching last sales order and assigning upcoming ref no as current + 1
        # Also check for if any bill is deleted and ref no is continuos w r t the deleted sales order
        latest_so = Fin_Sales_Order.objects.filter(Company = cmp).order_by('-id').first()

        new_number = int(latest_so.reference_no) + 1 if latest_so else 1

        if Fin_Sales_Order_Reference.objects.filter(Company = cmp).exists():
            deleted = Fin_Sales_Order_Reference.objects.get(Company = cmp)
            
            if deleted:
                while int(deleted.reference_no) >= new_number:
                    new_number+=1

        # Finding next SO number w r t last SO number if exists.
        nxtSO = ""
        lastSO = Fin_Sales_Order.objects.filter(Company = cmp).last()
        if lastSO:
            salesOrder_no = str(lastSO.sales_order_no)
            numbers = []
            stri = []
            for word in salesOrder_no:
                if word.isdigit():
                    numbers.append(word)
                else:
                    stri.append(word)
            
            num=''
            for i in numbers:
                num +=i
            
            st = ''
            for j in stri:
                st = st+j

            s_order_num = int(num)+1

            if num[0] == '0':
                if s_order_num <10:
                    nxtSO = st+'0'+ str(s_order_num)
                else:
                    nxtSO = st+ str(s_order_num)
            else:
                nxtSO = st+ str(s_order_num)

        return Response(
            {
                "status": True,
                "items": itemSerializer.data,
                "customers":custSerializer.data,
                "vendor":venSerializer.data,
                "paymentTerms":pTermSerializer.data,
                "banks":bankSerializer.data,
                "priceList":lstSerializer.data,
                "custPriceList":clSerializer.data,
                "units":unitSerializer.data,
                "accounts":accSerializer.data,
                "refNo": new_number,
                "soNo": nxtSO,
                "state": cmp.State

            }, status=status.HTTP_200_OK
        )
    except Exception as e:
        print(e)
        return Response(
            {"status": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )