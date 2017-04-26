<style>
	#target4{
		/*height: 300px;*/
		background: #fff;
		color: #666;
		padding: 20px;
		text-align:justify;
		width: 350px;
	}
	#target4 h2{

	}
	#target4 h2,
	#target4 .exPageLink{
		color: #333;
	}
</style>
<div id="target4">
	<h2>Hey! That's the example 4!</h2>
	<p>Parameter: <?php echo $_GET['parameter']; ?></p>
	<a class="exPagelink" href="#" onclick="$.edbox('close'); return false;">close the box!</a>
</div>
