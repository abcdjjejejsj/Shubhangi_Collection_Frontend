// ====== DOM Elements ======
// import "./config";
const navLinks = document.querySelectorAll('.admin-nav a');
const sections = document.querySelectorAll('.admin-section');
const toggleLink = document.getElementById('toggle-Link');
const nav = document.querySelector('nav');

// ====== Dashboard Stats ======
async function loadWebsiteContent() {
            const form = document.getElementById('websiteContentForm');
            const statusElement = document.getElementById('currentLogoStatus');
            console.log("hellllllllllllllllll")

            try {
                const response = await fetch(`${Backend_URL}/website-content`);
                if (!response.ok) {
                    // This handles cases where the document might not exist yet (404)
                    if (response.status === 404) {
                        console.log("No existing content found. Starting with default empty form.");
                        return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const content = await response.json();
                
                // Populate form fields
                document.getElementById('heroLine').value = content.heroLine || '';
                document.getElementById('subHeroLine').value = content.subHeroLine || '';
                document.getElementById('aboutUs').value = content.aboutUs || '';
                document.getElementById('contactEmail').value = content.contactEmail || '';
                document.getElementById('contactPhone').value = content.contactPhone || '';
                document.getElementById('contactAddress').value = content.contactAddress || '';
                // document.getElementById('socialProfile').value = content.socialProfile || '';
                document.getElementById('shopName').value = content.shopName || '';
                document.getElementById('logoText').value = content.logoText || '';

                // Handle logo display status
                if (content.logoUrl) {
                    statusElement.innerHTML = `Current Logo: <a href="${content.logoUrl}" target="_blank" class="text-indigo-600 hover:underline">View Logo</a>. Upload new file to replace.`;
                } else if (content.logoText) {
                    statusElement.textContent = `Current Logo: Text logo ("${content.logoText}") is in use.`;
                } else {
                    statusElement.textContent = 'No logo or text logo configured yet.';
                }
                
                console.log("Website content loaded successfully.");

            } catch (error) {
                console.error("Error loading website content:", error);
                showPopup("Failed to load website content. Please check the console for details.");
            }
        }

        // Function to save/update website content (PUT request)
        async function saveWebsiteContent() {
            const form = document.getElementById('websiteContentForm');
            
            // 1. Validate required fields before proceeding
            if (!form.reportValidity()) {
                showPopup("Please fill out all required fields.");
                return;
            }

            // 2. Create FormData object: ESSENTIAL for sending files (like logoFile)
            const formData = new FormData(form);

            // Optional: Log form data keys for debugging
            // for (let pair of formData.entries()) {
            //     console.log(pair[0] + ', ' + pair[1]);
            // }

            try {
                // Since this is an update, we use PUT. 
                // The backend handles whether to create a new document or update an existing one.
                const response = await fetch(`${Backend_URL}/website-content`, {
                    method: 'PUT',
                    // IMPORTANT: Do NOT set 'Content-Type': 'multipart/form-data'. 
                    // When using FormData, the browser sets the correct boundary header automatically.
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(`Server error: ${response.status} - ${errorData.message || 'Check network'}`);
                }

                const updatedContent = await response.json();
                console.log("Updated Content Response:", updatedContent);
                showPopup("Website content saved and updated successfully!");
                
                // Reload content to update status/display any changes
                loadWebsiteContent();

            } catch (error) {
                console.error("Error saving website content:", error);
                showPopup(`Failed to save content. Error: ${error.message}`);
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', loadWebsiteContent);

let dashboardStats = {
  totalProducts: 0,
  totalCustomers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingAppointments: 0,
  newMessages: 0
};

loadOrders();

// START:Popup Function 
function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
                <div class="popup-content">
                    <p>${message}</p>
                    <button class="popup-btn">OK</button>
                </div>
            `;
  document.body.appendChild(popup);

  popup.querySelector(".popup-btn").addEventListener("click", () => {
    popup.remove();
  });
}
// END:Popup Function

function count() {
  fetch(`${Backend_URL}/dashboard/data`)
    .then(res => { return res.json() })
    .then(res => {
      console.log("dash user : ", res.totalP);

      dashboardStats.totalProduct = res.totalP;
      document.getElementById('totalProducts').textContent = dashboardStats.totalProduct;

      dashboardStats.totalCustomers = res.totalC;
      document.getElementById('totalCustomers').textContent = dashboardStats.totalCustomers;

      dashboardStats.newMessages = res.totalM;
      document.getElementById('newMessages').textContent = dashboardStats.newMessages;

      dashboardStats.pendingAppointments = res.totalA;
      document.getElementById('pendingAppointments').textContent = dashboardStats.pendingAppointments;

      dashboardStats.totalOrders = res.totalO;
      document.getElementById('totalOrders').textContent =dashboardStats.totalOrders;

    })
    .catch(err => {
      console.log("dash err:", err)
    })
}

function ProductForm() {
  document.getElementById("save").style.visibility = "visible";
  document.getElementById("saveChanges").style.visibility = "hidden";
  document.getElementById('newProductId').value = ""
  document.getElementById('newProductId').disabled = false;
  document.getElementById('newProductId').style.cursor = "text";
  document.getElementById('newProductName').value = "";
  document.getElementById('newProductCategory').value = "";
  document.getElementById('newProductPrice').value = "";
  document.getElementById('newProductStock').value = "";
  // document.getElementById('trend').value = obj.Product_Trend;
  showAddProductForm();
}

function loadTableData() {
  let table = document.getElementById("productTable");

  fetch(`${Backend_URL}/product/getTableData`)
    .then(res => { return res.json() })
    .then(data => {
      console.log("table data : ", data);
      table.innerHTML = "";
      let td;
      data.forEach(obj => {
        let tr = document.createElement("tr");
        let span = document.createElement("span");
        for (k in obj) {
          td = document.createElement("td");
          if (k == "Product_Images") {
            let img = document.createElement("img");
            img.src = `${obj[k][0]}`;
            // img.id =k.dataset.key;
            td.setAttribute("data-label", k.split("_")[1]);
            td.append(img);
            tr.append(td);
          } else if (k == "Product_Status") {
            span.textContent = obj[k];
            td.append(span)
            td.setAttribute("data-label", k.split("_")[1]);
            // td.id = k.split("_")[1];
            if (obj[k] == "active" || obj[k] == "Active") {
              span.className = "status-badge active";
            } else {
              span.className = "status-badge";
            }
            tr.append(td);
          } else if (k != "_id" && k != "__v") {
            td.textContent = obj[k];
            td.setAttribute("data-label", k.split("_")[1]);
            // td.id = k.split("_")[1];
            tr.append(td);
          }

        }

        td = document.createElement("td");
        td.className = "action-buttons";
        td.setAttribute("data-label", "Actions")


        let btn = document.createElement("button");
        btn.textContent = "Edit"
        btn.className = "btn btn-secondary edit-product-btn";
        btn.addEventListener('click', () => {
          document.getElementById('newProductId').value = obj.Product_ID
          document.getElementById('newProductId').disabled = true;
          document.getElementById('newProductId').style.cursor = "not-allowed";
          document.getElementById('newProductName').value = obj.Product_Name;
          document.getElementById('newProductCategory').value = obj.Product_Category;
          document.getElementById('newProductPrice').value = obj.Product_Price;
          document.getElementById('newProductStock').value = obj.Product_Stock;
          document.getElementById('trend').value = obj.Product_Trend;

          showAddProductForm();
          let update = document.getElementById("saveChanges");
          document.getElementById("save").style.visibility = "hidden";
          update.style.visibility = "visible";
          let form = document.getElementById("form-actions-btn");
          let editButton = document.getElementById("saveChanges");

          editButton.addEventListener("click", () => {
            const productId = document.getElementById('newProductId').value;
            const productName = document.getElementById('newProductName').value;
            const category = document.getElementById('newProductCategory').value;
            const price = parseFloat(document.getElementById('newProductPrice').value).toFixed(2);
            const stock = document.getElementById('newProductStock').value;
            const trend = document.getElementById('trend').value;
            const productImage = document.getElementById('newProductImage').files[0];

            const formData = new FormData();
            formData.append("Product_ID", productId);
            formData.append("Product_Name", productName);
            formData.append("Product_Category", category);
            formData.append("Product_Price", price);
            formData.append("Product_Stock", stock);
            formData.append("Product_Trend", trend);
            formData.append("Product_Image", productImage);

            fetch(`${Backend_URL}/product/updateData`, {
              method: "POST",
              body: formData
            })
              .then((res) => res.text())
              .then((msg) => {
                if (msg == "Product updated successfully") {
                  document.getElementById('newProductId').value = "";
                  document.getElementById('newProductName').value = "";
                  document.getElementById('newProductCategory').value = "";
                  document.getElementById('newProductPrice').value = "";
                  document.getElementById('newProductStock').value = "";
                  document.getElementById('trend').value = "";
                }
                loadTableData();
                showPopup(msg);
                hideAddProductForm();
              })
              .catch(err => showPopup(err));

          })
        });

        td.append(btn);

        btn = document.createElement("button");
        btn.textContent = "Delete"
        btn.className = "btn btn-primary delete-product-btn";
        btn.addEventListener("click", () => {
          fetch(`${Backend_URL}/product/deleteData`, {
            method: "POST",
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ ID: obj.Product_ID })
          })
            .then((res) => res.text())
            .then((msg) => {
              if (msg === "Product deleted Successfully") {
                loadTableData();
                count();
              }
              showPopup(msg);
            })
            .catch(err => showPopup(err));
        })
        td.append(btn);


        btn = document.createElement("button");
        if (obj.Product_Status == "Inactive") {
          btn.textContent = "activate";
        } else {
          btn.textContent = "Deactivate";
        }

        btn.className = "btn btn-secondary toggle-status-btn";
        btn.addEventListener('click', () => {
          const statusBadge = span;
          if (statusBadge.classList.contains('active')) {
            statusBadge.textContent = 'Inactive';
            statusBadge.className = 'status-badge';
            btn.textContent = 'Activate';
            fetch(`${Backend_URL}/product/status`, {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                Product_ID: obj.Product_ID,
                Product_Status: "Inactive"
              })
            })
              .then(res => res.text())
              .then(data => showPopup(data))
              .catch(err => showPopup(err));

          } else {
            fetch(`${Backend_URL}/product/status`, {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                Product_ID: obj.Product_ID,
                Product_Status: "Active"
              })
            })
              .then(res => res.text())
              .then(data => showPopup(data))
              .catch(err => showPopup(err));
            statusBadge.textContent = 'active';
            statusBadge.className = 'status-badge active';
            btn.textContent = 'Deactivate';
          }
        })

        td.append(btn);

        tr.append(td);

        table.append(tr);
      }

      )
    })
    .catch(err => console.log("table cha error: ", err))

} //end of loadtable





//Initialize Dashboard 
function initDashboard() {
  count();
  loadTableData();
  loadCategory();

  // Set active nav link based on scroll position
  window.addEventListener('scroll', setActiveNavLink);

  // Smooth scrolling for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Initialize all modules
  initProductManagement();
  initCategoryManagement();
  initOrderManagement();
  initCustomerManagement();
  initAppointmentManagement();
  initDiscountManagement();
  initMessageManagement();
  initSettings();
}

// ====== Navigation ======
function setActiveNavLink() {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;

    if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
}







function toggleNav() {
  nav.classList.toggle('active');
  toggleLink.classList.toggle('active');
}

// ====== Product Management ======
function initProductManagement() {
  const addProductForm = document.getElementById('addProductForm');
  const productsTable = document.getElementById('productsTable');

  // Show/hide add product form
  window.showAddProductForm = function () {
    addProductForm.style.display = 'block';
    addProductForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideAddProductForm = function () {
    addProductForm.style.display = 'none';
    addProductForm.reset();
  };

  // Save product
 window.saveProduct = function () {
    const productId = document.getElementById('newProductId').value;
    const productName = document.getElementById('newProductName').value;
    const category = document.getElementById('newProductCategory').value;
    const price = parseFloat(document.getElementById('newProductPrice').value).toFixed(2);
    const stock = document.getElementById('newProductStock').value;
    const trend = document.getElementById('trend').value;
    const status = document.getElementById('status').value;

    const files = document.getElementById("newProductImages").files;

    // validation
    if (!productId || !productName || !category || !price || !stock || files.length === 0) {
        showPopup("Please fill all required fields and upload at least one image");
        return;
    }

    // build FormData
    const formData = new FormData();
    formData.append("Product_ID", productId);
    formData.append("Product_Name", productName);
    formData.append("Product_Category", category);
    formData.append("Product_Price", price);
    formData.append("Product_Stock", stock);
    formData.append("Product_Trend", trend);
    formData.append("Product_Status", status);

    // Append all selected images
    for (let i = 0; i < files.length; i++) {
        formData.append("Product_Images", files[i]);
    }

    console.log("formData :",formData);

    fetch(`${Backend_URL}/product/addProduct`, {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(msg => {
        loadTableData();
        count();
        showPopup(msg);
    })
    .catch(err => showPopup(err));

    // Hide form and reset
    hideAddProductForm();
};


}

function CategoryForm() {

  document.getElementById("saveCat").style.visibility = "visible";
  document.getElementById("updateCat").style.visibility = "hidden";
  document.getElementById('newCategoryName').value = "";

  showAddCategoryForm();
}

//load category
function loadCategory() {
  fetch(`${Backend_URL}/category/sendCategory`)
    .then((res) => { return res.json()})
    .then((data) => {
      console.log("category :", data);
      // {_id: '68a727fb027431b00a5eefea', Category_ID: '#CAT004', Category_Name: 'haar', Category_type: 'Product', __v: 0}
      let table = document.getElementById("categoryTable");
      table.innerHTML = "";
      data.forEach(obj => {
        let row = document.createElement("tr");
        let td;
        for (k in obj) {
          if (k == "_id" || k == "__v") {

          } else {
            td = document.createElement("td");
            td.setAttribute("data-label", k.split("_")[0] + "  " + k.split("_")[1]);
            td.textContent = obj[k];
            row.append(td);
          }
        }

        td = document.createElement("td");
        td.setAttribute("data-label", "Actions");
        td.className = "action-buttons";

        let edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "btn btn-secondary edit-category-btn";
        edit.addEventListener('click', () => {
          // const cells = row.querySelectorAll('td');
          document.getElementById('newCategoryName').value = obj.Category_Name;
          document.getElementById('newCategoryType').value = obj.Category_type;

          const save = document.getElementById("saveCat");
          const update = document.getElementById("updateCat");
          save.style.visibility = "hidden";
          update.style.visibility = "visible";

          update.addEventListener("click", () => {
            const updatedCat = {
              Category_ID: obj.Category_ID,
              Category_Name: document.getElementById('newCategoryName').value,
              Category_type: document.getElementById('newCategoryType').value
            }

            fetch(`${Backend_URL}/category/editCategory`, {
              method: "post",
              headers:
              {
                'content-type': 'application/json'
              },
              body: JSON.stringify(updatedCat)
            })
              .then(res => { return res.text() })
              .then((res) => {
                showPopup(res);
                loadCategory();
              })
              .catch((err) => {
                showPopup(err);
                console.log("category edit error : ", err);
              })
          })


          showAddCategoryForm();

        });
        td.append(edit);
        row.append(td);

        let del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "btn btn-primary delete-category-btn";
        del.addEventListener("click", () => {
          fetch(`${Backend_URL}/category/deleteCategory`, {
            method: "post",
            headers:
            {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ Category_ID: obj.Category_ID })
          })
            .then(res => { return res.text() })
            .then((res) => {
              showPopup(res)
              loadCategory();
            })
            .catch((err) => {
              showPopup(err);
              console.log("category edit error : ", err);
            })
        })//end of del listener
        td.append(del);
        row.append(td);


        table.append(row);

      })//end of foreach

    })
    .catch(err => {
      console.log("category cha error : ", err);
      showPopup("category error: ");
    })
}

// ====== Category Management ======
function initCategoryManagement() {
  const addCategoryForm = document.getElementById('addCategoryForm');
  const categoriesTable = document.getElementById('categoriesTable');

  window.showAddCategoryForm = function () {
    addCategoryForm.style.display = 'block';
    addCategoryForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideAddCategoryForm = function () {
    addCategoryForm.style.display = 'none';
    addCategoryForm.reset();
  };


  window.saveCategory = function () {
    const categoryName = document.getElementById('newCategoryName').value;
    const categoryType = document.getElementById('newCategoryType').value;

    if (!categoryName || !categoryType) {
      showPopup('Please fill all required fields');
      return;
    }

    // Generate ID
    const rowCount = categoriesTable.querySelectorAll('tbody tr').length + 1;
    const categoryId = `#CAT${rowCount.toString().padStart(3, '0')}`;


    const cat = {
      ID: categoryId,
      Category_Name: categoryName,
      Type: categoryType,
    }

    fetch(`${Backend_URL}/category/addCategory`, {
      method: "post",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(cat)
    })
      .then((res) => { return res.text() })
      .then((res) => {
        showPopup(res);
        console.log("category ID : ", categoryId);
        loadCategory()

      })
      .catch((err) => {
        showPopup(err);
        console.log("category error :", err);
      });


  };
}

// ====== Order Management ======
function initOrderManagement() {
  const editOrderForm = document.getElementById('editOrderForm');
  const ordersTable = document.getElementById('ordersTable');

  window.showEditOrderForm = function (orderId) {
    // In a real app, you would fetch order data by ID
    // For demo, we'll use the first order's data
    const orderRow = ordersTable.querySelector('tbody tr');
    const cells = orderRow.querySelectorAll('td');

    document.getElementById('editOrderIdHidden').value = cells[0].textContent;
    document.getElementById('editOrderCustomer').value = cells[1].textContent;
    document.getElementById('editOrderDate').value = cells[2].textContent;
    document.getElementById('editOrderTotal').value = cells[3].textContent.replace('$', '');
    document.getElementById('editOrderStatus').value = cells[4].querySelector('span').textContent.toLowerCase();

    editOrderForm.style.display = 'block';
    editOrderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideEditOrderForm = function () {
    editOrderForm.style.display = 'none';
    editOrderForm.reset();
  };

  window.saveOrderChanges = function () {
    const orderId = document.getElementById('editOrderIdHidden').value;
    const customer = document.getElementById('editOrderCustomer').value;
    const date = document.getElementById('editOrderDate').value;
    const total = parseFloat(document.getElementById('editOrderTotal').value).toFixed(2);
    const status = document.getElementById('editOrderStatus').value;

    if (!customer || !date || !total || !status) {
      alert('Please fill all required fields');
      return;
    }

    // Find and update the order (in a real app, you would update the database)
    const orderRows = ordersTable.querySelectorAll('tbody tr');
    orderRows.forEach(row => {
      if (row.querySelector('td').textContent === orderId) {
        const cells = row.querySelectorAll('td');
        cells[1].textContent = customer;
        cells[2].textContent = date;
        cells[3].textContent = `$Rs.{total}`;

        const statusBadge = cells[4].querySelector('span');
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusBadge.className = 'status-badge ' + status;
      }
    });

    hideEditOrderForm();
  };

  // Add event listeners to edit buttons
  ordersTable.querySelectorAll('.edit-order-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const orderId = this.closest('tr').querySelector('td').textContent;
      showEditOrderForm(orderId);
    });
  });

  // Add event listeners to delete buttons
  ordersTable.querySelectorAll('.delete-order-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this order?')) {
        this.closest('tr').remove();
        dashboardStats.totalOrders--;
        document.getElementById('totalOrders').textContent = dashboardStats.totalOrders;
      }
    });
  });
}

// Customer Management 
function loadCustomer() {
  let table = document.getElementById("customerTable");
  fetch(`${Backend_URL}/api/getCustomers`)
    .then((res) => { return res.json() })
    .then((data) => {
      console.log("users data :", data);
      let row, td;
      let count = 0;
      data.forEach((obj) => {

        row = document.createElement("tr");
        td = document.createElement("td");
        td.setAttribute("data-label", "Sr.no");
        td.textContent = count;
        row.append(td);
        count++;
        for (k in obj) {
          if (k != "_id" && k != "password" && k != "confirmPassword" && k != "__v" && k!="Image") {
            td = document.createElement("td");
                      td.style.overflowX="scroll";
            td.setAttribute("data-label", k);
            td.textContent = obj[k];
            row.append(td);
          }
        }
        td = document.createElement("td");
        td.setAttribute("data-label", "Actions");
        td.className = "action-buttons";

        let btn = document.createElement("button");
        btn.className = "btn btn-secondary view-orders-btn";
        btn.textContent = "View Orders";
        btn.addEventListener("click", () => {
          let s = `Total order placed : 4, ===============================> Pending :2[har,bangles], ===============================> Completed:2[jhumka,watch]`;
          console.log("ss:: ", s)
          fetch(`${Backend_URL}/order/getOrderSummary`, {
            method: "post",
            headers: {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ email: obj.email })
          })
            .then(res => res.json())
            .then(res => {
              console.log("res : ", res);
              showPopup(res.summaryString);
            })


        })
        td.append(btn);

        row.append(td);
        table.append(row);
      })

    })
    .catch(err => {
      console.log(err);
      showPopup(err);
    })
}

function initCustomerManagement() {
  loadCustomer();

}

function loadAppointments() {
  let table = document.getElementById("appointmentsTable");
  let tbody = document.getElementById("appTable");
  tbody.innerHTML = "";
  fetch(`${Backend_URL}/parlor/sendData`)
    .then((res) => { return res.json() })
    .then((data) => {
      if(data.length==0)
  {
    console.log("No orders found !");
    return;
  }else if(data.message)
  {
    console.log("server res for parlor/senddata fetching: ",data.message);
    return;
  }
      console.log("beauty data :", data);
      let row, td;
      let count = 1;
      data.forEach((obj) => {

        row = document.createElement("tr");
        td = document.createElement("td");
        td.setAttribute("data-label", "Sr.no");
        td.textContent = count;
        row.append(td);
        count++;
        for (k in obj) {

          if (k == "Service") {
            console.log("1st obj : ", obj[k][0]);
            console.log("2nd obj : ", obj[k][1]);

            td = document.createElement("td");
            for (let i = 0; i < obj[k].length; i++) {
              let span = document.createElement("span");
              let br = document.createElement("br");
              span.textContent = "=> " + obj[k][i];
              td.append(span);
              td.append(br);
            }
            // row.append(td);
            // td = document.createElement("td");
            // td.textContent="-"
            // td.style.textAlign="center";
            row.append(td);


          }
          if (k != "_id" && k != "__v" && k != "Service") {
            td = document.createElement("td");
            td.setAttribute("data-label", k);
            td.textContent = obj[k];
            row.append(td);
          }
        }
        td = document.createElement("td");
        td.setAttribute("data-label", "Actions");
        td.className = "action-buttons";

        let completed = document.createElement("button");
        completed.className = "btn btn-primary mark-replied-btn";
        completed.textContent = "Completed";
        completed.addEventListener("click", () => {
          if (obj.Status == "pending") {
            alert("hello");
            fetch(`${Backend_URL}/parlor/updateStatus`, {
              method: "POST",
              headers: {
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                id: obj._id
              })
            })
              .then(res => { return res.text() })
              .then(res => {
                showPopup(res);
                loadAppointments()
              })
              .catch(err => {
                showPopup(err);

                console.log("paro : ", err);
              })
          }

        })

        td.append(completed);

        let btn = document.createElement("button");
        btn.className = "btn btn-primary mark-replied-btn";
        btn.textContent = "Add Beautician";

        btn.addEventListener("click", () => {
          showAddAppointmentForm();
          document.getElementById("parlorSave").addEventListener("click", () => {
            let name = document.getElementById("beauty").value;
            console.log("beautician : ", name);
            let b = document.getElementById("parlorSave");
            b.addEventListener("click", () => {
              console.log("hit the event");
              fetch(`${Backend_URL}/parlor/updateBeautician`, {
                method: "POST",
                headers: {
                  'content-type': 'application/json'
                },
                body: JSON.stringify({
                  id: obj._id,
                  Beautician: name
                })
              })
                .then(res => { return res.text() })
                .then(res => {
                  showPopup(res);
                  loadAppointments()
                })
                .catch(err => {
                  showPopup(err);
                  console.log("paro : ", err);
                })

            })
          })


        })

        td.append(btn);

        row.append(td);
        tbody.append(row);
      })

    })
    .catch(err => {
      console.log(err);
      showPopup(err);
    })

}

// ====== Appointment Management ======
function initAppointmentManagement() {
  loadAppointments();
  const addAppointmentForm = document.getElementById('addAppointmentForm');
  const appointmentsTable = document.getElementById('appointmentsTable');

  window.showAddAppointmentForm = function () {
    addAppointmentForm.style.display = 'block';
    addAppointmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.hideAddAppointmentForm = function () {
    addAppointmentForm.style.display = 'none';
    addAppointmentForm.reset();
  };

  window.saveAppointment = function () {


  }
}

// ====== Discount Management ======
// function initDiscountManagement() {
//   const discountForm = document.getElementById('discountForm');
//   const discountsTable = document.getElementById('discountsTable');

//   window.showAddDiscountForm = function () {
//     discountForm.style.display = 'block';
//     discountForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     document.getElementById('discountIdHidden').value = '';
//   };

//   window.hideDiscountForm = function () {
//     discountForm.style.display = 'none';
//     discountForm.reset();
//   };

//   function loadDiscount() {
//     fetch(`${Backend_URL}/order/getDiscount`)
//       .then(res => res.json())
//       .then(data => {
//         let bdy = document.getElementById("disBody");
//         bdy.innerHTML="";
//         data.forEach(obj=>{
//           let row = `
//       <tr>
//                             <td data-label="Code">${obj.code}</td>
//                             <td data-label="Type">${obj.type}</td>
//                             <td data-label="Value">${obj.value}</td>
//                             <td data-label="Min. Purchase">${obj.purchase}</td>
//                             <td data-label="Expiry Date">${obj.date}</td>
//                             <td data-label="Actions" class="action-buttons">
//                                 <button class="btn btn-secondary edit-discount-btn" onclick="editDiscount(${obj})">Edit</button>
//                                 <button class="btn btn-primary delete-discount-btn" onclick="${delDiscount({code:obj.code})}">Delete</button>
//                             </td>
//                         </tr>
//       `;
//       bdy.innerHTML+=row;


//         })
//       })
//   }

//   loadDiscount();
//   function editDiscount(obj)
//   {
//     alert("hello ")
//     showAddDiscountForm();
    

  
//     fetch(`${Backend_URL}/order/updateDiscount`,{
//       method:"post",
//       headers:{
//         'content-type':'application/json'
//       },
//       body:JSON.stringify({})
//     })
//       .then(res => res.json())
//   }

//   function delDiscount(obj)
//   {
    
//   }
//   window.saveDiscount = function () {
//     // Get the form elements by their unique IDs
//     const codeInput = document.getElementById('discountCode');
//     const typeSelect = document.getElementById('discountType');
//     const valueInput = document.getElementById('discountValue');
//     const minPurchaseInput = document.getElementById('discountMinPurchase');
//     const expiryDateInput = document.getElementById('discountExpiry');

//     // Collect the values into a JavaScript object
//     const discountData = {
//       // The hidden ID is useful for editing/updating an existing discount
//       code: codeInput.value.trim(),
//       type: typeSelect.value,
//       value: valueInput.value.trim(),
//       // Convert to a number. Use null/0 if empty or invalid.
//       purchase: parseFloat(minPurchaseInput.value) || 0,
//       date: expiryDateInput.value
//     };

//     console.log('Collected Discount Data:', discountData);
//     fetch(`${Backend_URL}/order/addDiscount`, {
//       method: "post",
//       headers: {
//         'content-type': 'application/json'
//       },
//       body: JSON.stringify(discountData)
//     })
//       .then(res => res.text())
//       .then(res => {
//         showPopup(res);
//       })

//     // Hide form and reset
//     hideDiscountForm();
//   };

//   // Add event listeners to existing discount rows
//   discountsTable.querySelectorAll('tbody tr').forEach(row => {
//     addDiscountRowEvents(row);
//   });

//   function addDiscountRowEvents(row) {
//     // Edit button
//     row.querySelector('.edit-discount-btn').addEventListener('click', () => {
//       const cells = row.querySelectorAll('td');
//       document.getElementById('discountIdHidden').value = cells[0].textContent;
//       document.getElementById('discountCode').value = cells[0].textContent;
//       document.getElementById('discountProductId').value = cells[1].textContent === 'N/A' ? '' : cells[1].textContent;
//       document.getElementById('discountType').value = cells[3].textContent;
//       document.getElementById('discountValue').value = cells[4].textContent;
//       document.getElementById('discountMinPurchase').value = cells[5].textContent.replace('Rs.', '');

//       // Parse expiry date back to input format
//       const expiryDate = new Date(cells[6].textContent);
//       const formattedDate = expiryDate.toISOString().split('T')[0];
//       document.getElementById('discountExpiry').value = formattedDate;

//       showAddDiscountForm();
//     });

//     // Delete button
//     row.querySelector('.delete-discount-btn').addEventListener('click', () => {
//       if (confirm('Are you sure you want to delete this discount?')) {
//         row.remove();

//       }
//     });
//   }
// }

// ====== Discount Management ======
function initDiscountManagement() {
    const discountForm = document.getElementById('discountForm');
    
    // Helper to control form visibility and state
    window.showAddDiscountForm = function (isEditing = false) {
        discountForm.style.display = 'block';
        document.getElementById('saveDiscountButton').textContent = isEditing ? 'Update Discount' : 'Save Discount';
        
        // Ensure ID is cleared when adding new
        if (!isEditing) {
            document.getElementById('discountIdHidden').value = '';
            document.getElementById('discountCode').disabled = false;
        }
        discountForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.hideDiscountForm = function () {
        discountForm.style.display = 'none';
        discountForm.reset();
        document.getElementById('discountIdHidden').value = '';
        document.getElementById('discountCode').disabled = false;
    };

    // New: Handle deletion using the MongoDB _id
    window.delDiscount = function (discountId) {
        if (!discountId) {
             showPopup("Error: Discount ID is missing.");
             return;
        }
        
        // We are passing the _id to the backend for deletion
        fetch(`${Backend_URL}/order/delDiscount`, {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ _id: discountId }) // Sending _id for deletion
        })
        .then(res => res.text())
        .then(msg => {
            showPopup(msg);
            loadDiscount(); // Reload the table data
        })
        .catch(err => showPopup("Delete failed: " + err));
    };

    // New: Handle editing (pre-fills form data)
    window.editDiscount = function (buttonElement) {
        try {
            // Retrieve the full discount object stored in the data-discount attribute
            const dataString = buttonElement.getAttribute('data-discount');
            const obj = JSON.parse(dataString);
            console.log("editable :  : ",obj);
            
            showAddDiscountForm(true);

            // Populate form fields using the MongoDB _id
            document.getElementById('discountIdHidden').value = obj._id; 
            document.getElementById('discountCode').value = obj.code;
            document.getElementById('discountCode').disabled = true; // Prevent changing the code when editing

            document.getElementById('discountType').value = obj.type;
            document.getElementById('discountValue').value = obj.value;
            document.getElementById('discountMinPurchase').value = obj.purchase;
            document.getElementById('discountExpiry').value = obj.date; // Assuming it's in a date-friendly format

        } catch(error) {
            console.error("Error parsing discount data:", error);
            showPopup("Failed to load discount data for editing.");
        }
    };


    function loadDiscount() {
        fetch(`${Backend_URL}/order/getDiscount`)
            .then(res => res.json())
            .then(data => {
                let bdy = document.getElementById("disBody");
                bdy.innerHTML = ""; 

                data.forEach(obj => {
                    // CRITICAL FIX: Store the object data safely in a data-attribute for editing.
                    // IMPORTANT: We use obj._id (the MongoDB ID) for deletion.
                    const safeDiscountData = JSON.stringify(obj).replace(/"/g, '&quot;'); 

                    let row = `
                        <tr>
                            <td data-label="Code">${obj.code}</td>
                            <td data-label="Type">${obj.type}</td>
                            <td data-label="Value">${obj.value}</td>
                            <td data-label="Min. Purchase">${obj.purchase}</td>
                            <td data-label="Expiry Date">${obj.date}</td>
                            <td data-label="Actions" class="action-buttons">
                                <button class="btn btn-secondary edit-discount-btn" 
                                        data-discount="${safeDiscountData}" 
                                        onclick="editDiscount(this)">Edit</button>
                                <!-- CRITICAL FIX: Pass the _id as a string literal and call delDiscount() on click -->
                                <button class="btn btn-primary delete-discount-btn" 
                                        onclick="delDiscount('${obj._id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                    bdy.innerHTML += row;
                });
            })
            .catch(err => {
                console.error("Error loading discounts:", err);
                showPopup("Failed to load discounts.");
            });
    }

    loadDiscount();

    // MODIFIED: window.saveDiscount now handles both ADD and UPDATE using the hidden _id
    window.saveDiscount = function () {
        const codeInput = document.getElementById('discountCode');
        const typeSelect = document.getElementById('discountType');
        const valueInput = document.getElementById('discountValue');
        const minPurchaseInput = document.getElementById('discountMinPurchase');
        const expiryDateInput = document.getElementById('discountExpiry');
        const hiddenId = document.getElementById('discountIdHidden').value; // Check for hidden _id

        const isUpdating = !!hiddenId;
        
        const discountData = {
            // Conditionally include _id only when updating
            ...(isUpdating && { _id: hiddenId }), 
            code: codeInput.value.trim(),
            type: typeSelect.value,
            value: valueInput.value.trim(),
            purchase: parseFloat(minPurchaseInput.value) || 0,
            date: expiryDateInput.value
        };

        // Determine API endpoint and method
        const endpoint = isUpdating ? `${Backend_URL}/order/updateDiscount` : `${Backend_URL}/order/addDiscount`;

        fetch(endpoint, {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(discountData)
        })
        .then(res => res.text())
        .then(res => {
            showPopup(res);
            loadDiscount(); 
            hideDiscountForm(); 
        })
        .catch(err => {
            showPopup("Operation failed: " + err);
            document.getElementById('discountCode').disabled = false;
        });
    };
    
    // The previous event listeners part is no longer needed since we use onclick attributes in loadDiscount.
}

// ====== Message Management ======
function loadMessage() {
  const mesg = document.getElementById("mesgTable");
  mesg.innerHTML = "";
  fetch(`${Backend_URL}/api/getContact`)
    .then(res => { return res.json() })
    .then(data => {
      // console.log("contact details : ",data);

      data.forEach(obj => {
        let tr, td, span;
        tr = document.createElement("tr");
        for (k in obj) {
          if (k == "_id" || k == "Subject" || k == "__v") {

          } else if (k == "Status") {
            td = document.createElement("td");
            td.setAttribute("data-label", k);
            span = document.createElement("span");
            if (obj[k] == "New") {
              span.className = "status-badge pending";
            } else {
              span.className = "status-badge replied";
            }
            span.textContent = obj[k];
            td.append(span);
            tr.append(td);

          } else {
            td = document.createElement("td");
            td.textContent = obj[k];
            if (k == "Message") {
              td.style.whiteSpace = "normal";
              td.style.wordWrap = "break-word";
              td.style.textAlign = "left";

            }
            td.setAttribute("data-label", k);
            tr.append(td);
          }
        }
        td = document.createElement("td");
        td.setAttribute("data-label", "Actions");
        td.className = "action-buttons";

        let view = document.createElement("button");
        view.className = "btn btn-secondary view-msg-btn";
        view.textContent = "View";
        view.addEventListener("click", () => {
          const message = obj.Message;
          // alert(`Message content:\n\n${message}`);
          showPopup(message);
        });

        let replied = document.createElement("button");
        replied.className = "btn btn-primary mark-replied-btn";
        replied.textContent = "Mark Replied";
        if (obj.Status == "New") {
          replied.textContent = "Mark Replied";
        } else {
          replied.textContent = "Mark as Not Replied";
        }

        replied.addEventListener('click', () => {
          let statusBadge = span;

          if (statusBadge.classList.contains('pending')) {
            statusBadge.textContent = 'Replied';
            statusBadge.className = 'status-badge replied';
            replied.textContent = "Mark as Not Replied";
            console.log("status get");
            console.log("text: ", span.textContent)
            fetch(`${Backend_URL}/api/changeStatus`, {
              method: "POST",
              headers: {
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                id: obj._id,
                status: "Replied"
              })
            })
              .then(res => { return res.text() })
              .then(data => {
                console.log("replied: ", data);
              })
              .catch(err => console.log(err))
          } else {
            statusBadge.textContent = 'New';
            statusBadge.className = 'status-badge pending';

            replied.textContent = "Mark Replied";
            fetch(`${Backend_URL}/api/changeStatus`, {
              method: "POST",
              headers: {
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                id: obj._id,
                status: "New"
              })
            })
              .then(res => { return res.text() })
              .then(data => {
                console.log("replied: ", data);
              })
              .catch(err => console.log(err))
          }
        });

        let del = document.createElement("button");
        del.className = "btn btn-primary delete-msg-btn";
        del.textContent = "Delete";
        del.addEventListener("click", () => {
          fetch(`${Backend_URL}/api/deletemesg`, {
            method: "post",
            headers:
            {
              'content-type': 'application/json'
            },
            body: JSON.stringify({ id: obj._id })
          })
            .then(res => { return res.text() })
            .then((res) => {
              showPopup(res);
              loadMessage();
              count();
            })
            .catch((err) => {
              showPopup(err);
              console.log("category edit error : ", err);
            })
        })//end of del listener

        td.append(view);
        td.append(replied);
        td.append(del);

        tr.append(td);



        mesg.append(tr);

      })
    })
    .catch(err => {
      console.log("error contact : ", err);
    })


}

function initMessageManagement() {
  loadMessage();

  const messagesTable = document.getElementById('messagesTable');

  // Add event listeners to view buttons
  messagesTable.querySelectorAll('.view-msg-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const message = this.closest('tr').querySelector('td:nth-child(3)').textContent;
      alert(`Message content:\n\n${message}`);
    });
  });

  // Add event listeners to mark as replied buttons
  messagesTable.querySelectorAll('.mark-replied-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const statusBadge = this.closest('tr').querySelector('.status-badge');
      if (statusBadge.classList.contains('pending')) {
        statusBadge.textContent = 'Replied';
        statusBadge.className = 'status-badge replied';

        dashboardStats.newMessages--;
        document.getElementById('newMessages').textContent = dashboardStats.newMessages;
      }
    });
  });

  // Add event listeners to delete buttons
  messagesTable.querySelectorAll('.delete-msg-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this message?')) {
        const row = this.closest('tr');
        const isPending = row.querySelector('.status-badge').classList.contains('pending');
        row.remove();


        if (isPending) {
          dashboardStats.newMessages--;
          document.getElementById('newMessages').textContent = dashboardStats.newMessages;
        }
      }
    });
  });
}

// ====== Settings ======
function initSettings() {
  window.changeAdminPassword = function () {
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;

    if (!currentPass || !newPass || !confirmPass) {

      return;
    }

    if (newPass !== confirmPass) {

      return;
    }

    // In a real app, you would validate current password and update it

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  };

  window.updateWebsiteContent = function () {
    const bannerText = document.getElementById('homeBannerText').value;

    if (!bannerText) {

      return;
    }


  };
}


// ====== Logout ======
window.logout = function () {
  if (confirm('Are you sure you want to logout?')) {
    // In a real app, you would clear session and redirect
    showPopup('Logged out successfully!');
    setTimeout(() => {
      window.location.href = 'login.html'; // Redirect to login page
    }, 1000);
  }
};

// ====== Initialize Everything ======
document.addEventListener('DOMContentLoaded', function () {
  // document.getElementById("save").style.visibility="visible";
  // document.getElementById("saveChanges").style.visibility="hidden";
  initDashboard();

  // Toggle mobile navigation
  // toggleLink.addEventListener('click', toggleNav);

  // Close mobile nav when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleNav();
      }
    });
  });
});














// Load Orders
async function loadOrders() {
  const res = await fetch(`${Backend_URL}/order/all`); // adjust path
  const orders = await res.json();
  console.log("ordeee :",orders);
  if(orders.length==0)
  {
    console.log("No orders found !");
    return;
  }else if(orders.message)
  {
    console.log("server res for order fetching: ",orders.message);
    return;
  }

  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";

  orders.forEach(order => {
    const total = order.items.reduce((sum, item) => sum + item.Product_Price * item.quantity, 0);

    const row = `
      <tr>
        <td data-label="Order ID">${order.orderId}</td>
        <td data-label="Customer">${order.userName}</td>
        <td data-label="Total">₹${total}</td>
        <td data-label="Paymnet Status"><span class="status-badge ${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span></td>
        <td data-label="Order Status"><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
        <td data-label="Date">${new Date(order.createdAt).toLocaleString()}</td>
        <td class="action-buttons" data-label="Action">
          <button class="btn btn-secondary" onclick='viewOrder(${JSON.stringify(order)})'>View</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}
// function saveStatus(order)
// {
//    document.getElementById("sss").addEventListener("click",()=>{
//     alert("hello   "+order);
//     console.log("orrr : ",order);
//    })

// }
// View Order
function viewOrder(order) {
  // Select all tables with a specific class

  let tables = document.querySelectorAll(".data-table");

  // Disable and blur all tables
  tables.forEach(table => {
    table.style.filter = "blur(4px)";
    table.style.pointerEvents = "none";
    table.style.userSelect = "none";
    table.style.opacity = "0.6";
  });

  document.getElementById("orderInfo").innerHTML = `
    <p><strong>Customer:</strong> ${order.userName} (${order.Email}, ${order.phone})</p>
    <p><strong>Address:</strong> ${order.address}</p>
    <p><strong>Delivery Code:</strong> ${order.deliveryCode}</p>
  `;

  const itemsBody = document.getElementById("orderItemsBody");
  itemsBody.innerHTML = "";
  order.items.forEach(item => {
    itemsBody.innerHTML += `
      <tr>
        <td>${item.Product_Name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.Product_Price}</td>
        <td><img src="${item.Product_Images[0]}" width="40"></td>
      </tr>
    `;
  });

  document.getElementById("orderTotal").innerText = order.items.reduce((sum, item) => sum + item.Product_Price * item.quantity, 0);
  document.getElementById("paymentStatus").innerText = order.paymentStatus;
  document.getElementById("paymentStatus").className = "status-badge " + order.paymentStatus.toLowerCase();
  document.getElementById("statusSelect").value = order.status;
  document.getElementById('modalOrderIdHidden').value = order.orderId;
  document.getElementById('del_code').value = order.deliveryCode;

  document.getElementById("orderModal").style.display = "flex";

}

function closeOrderModal() {
  document.getElementById("orderModal").style.display = "none";
  let tables = document.querySelectorAll(".data-table");
  tables.forEach(table => {
    table.style.filter = "none";
    table.style.pointerEvents = "auto";
    table.style.userSelect = "auto";
    table.style.opacity = "1";
  });

}

// function updateOrderStatus() {
//   const newStatus = document.getElementById("statusSelect").value;
// fetch(`${Backend_URL}/order/updateStatus`,{
//   method:"patch",
//   headers:{
//     'content-type':'application/json'
//   },
//   body:JSON.stringify()
// })
// .then(res=>res.json())
// .then(data=>{
//   alert("Order status updated to " + data);
// })


// alert("hello "+document.getElementById("orderInfo").textContent);
//   alert("kk : "+document.getElementById("ordersBody").textContent);
//   closeOrderModal();
// }

// window.onload = loadOrders;


function updateOrderStatus() {
  // 1. Retrieve the Order ID from the hidden field in the modal
  const orderId = document.getElementById('modalOrderIdHidden').value;

  // 2. Retrieve the New Status from the select element
  const newStatus = document.getElementById('statusSelect').value;

  const deliveryCode = document.getElementById('del_code').value

  if (!orderId) {
    // Handle error: No Order ID found (shouldn't happen if modal is set up correctly)
    console.error("Error: Order ID not found in modal.");
    showPopup("Error: Could not determine the order to update.");
    return;
  }

  // 3. Construct the Data Payload to send to the API
  const data = {
    orderId: orderId, // The ID of the order to update
    newStatus: newStatus, // The new status value (e.g., 'Shipped', 'Completed')
    deliveryCode: deliveryCode
  };

  // alert("data "+data);
  console.log("data   : ::: ", data);

  fetch(`${Backend_URL}/order/updateStatus`, {
    method: "post",
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(res => {
      console.log("ff : ", res);
      return res.json();
    })
    .then(data => {
      alert("Order status updated successfully");
      loadOrders();
    })
    .catch(err => {
      console.log("err P ::", err);
    })


}

