pragma solidity >=0.4.21 <0.9.0;

contract Test {
    uint256 public index = 0;
    struct Image {
        string path;
        string description;
        address payable account;
        uint256 tip;
    }
    mapping(uint256 => Image) public images;

    function uploadImage(string memory _path, string memory _description)
        public
    {
        index++;
        images[index] = Image(_path, _description, msg.sender, 0);
    }

    function makeTip(uint256 _imageID) public payable {
        Image memory _image = images[_imageID];
        address payable _author = _image.account;
        _author.transfer(msg.value);
    }
}
