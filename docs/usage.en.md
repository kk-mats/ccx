# Detect code clones
## Import a repository
CCX detects code clones from public Git repositories.

To detect code clones from your repository with CCX, enter the URL of your repository in the [https://sel.ist.osaka-u.ac.jp/webapps/ccx/new] form and import it. Depending on the repository, it may take several minutes.

Private Git repositories are not supported.

After the import is complete, you will be redirected to the project top page.

## Set the detection tool and parameters
Go to the top page of the project and click the button at the top left of the screen to display the menu. Select "Clone Detection" from the menu to set the detection tools and parameters to be used.
After completing the settings, press the RUN DETECTOR button to start the code clone detection.


# Analyze code clones
Select History from the menu to display a list of detection history. Select the desired one, and then select the SUMMARY tab on the screen after moving, and the VIEW RESULT button will appear. Clicking this button will take you to the analysis screen.

Selecting a file from the upper left pane will display the list of clone pairs contained in the file in the lower left pane. When you select a clone pair, its code fragments will be displayed in the center and right panes.